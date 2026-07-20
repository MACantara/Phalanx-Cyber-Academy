"""Blue Team vs Red Team simulation API."""
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.errors import DatabaseError, handle_supabase_error
from app.services.session_service import Session
from app.services.xp_award import XPManager
from app.services.xp_history_service import XPHistory
from app.supabase_client import get_supabase
from app.utils.timezone_utils import utc_now

router = APIRouter(prefix="/blue-vs-red", tags=["blue-vs-red"])

_game_states: Dict[int, Dict[str, Any]] = {}

INITIAL_TIME = 900  # 15 minutes in seconds


def _default_state() -> Dict[str, Any]:
    return {
        "isRunning": False,
        "timeRemaining": INITIAL_TIME,
        "startTime": None,
        "endTime": None,
        "session_id": None,
        "assets": {
            "academy-server": {"status": "secure", "integrity": 100},
            "student-db": {"status": "secure", "integrity": 100},
            "research-files": {"status": "secure", "integrity": 100},
            "learning-platform": {"status": "secure", "integrity": 100},
        },
        "alerts": [],
        "incidents": [],
        "securityControls": {
            "firewall": {"active": True, "effectiveness": 80},
            "endpoint": {"active": True, "effectiveness": 75},
            "access": {"active": True, "effectiveness": 85},
        },
        "aiDifficulty": "Normal",
        "currentPhase": "reconnaissance",
        "playerActions": [],
        "aiActions": [],
        "accumulatedXP": 0,
        "sessionXP": 0,
        "attacksMitigated": 0,
        "attacksSuccessful": 0,
        "blockedIPs": [],
    }


def _load_state(user_id: str) -> Dict[str, Any]:
    try:
        supabase = get_supabase()
        response = supabase.table("bvr_game_states").select("*").eq("profile_id", user_id).execute()
        data = handle_supabase_error(response)
        if data:
            stored = data[0].get("state", {})
            state = _default_state()
            state.update(stored)
            return state
    except Exception as e:
        raise DatabaseError(f"Failed to load BvR game state: {e}")
    return _default_state()


def _get_state(user_id: str) -> Dict[str, Any]:
    if user_id not in _game_states:
        _game_states[user_id] = _load_state(user_id)
    return _game_states[user_id]


def _save_state(user_id: str) -> None:
    state = _game_states.get(user_id, _default_state())
    try:
        supabase = get_supabase()
        supabase.table("bvr_game_states").upsert({
            "profile_id": user_id,
            "state": state,
            "updated_at": utc_now().isoformat(),
        }).execute()
    except Exception as e:
        raise DatabaseError(f"Failed to save BvR game state: {e}")


def _calc_asset_integrity(assets: Dict[str, Any]) -> float:
    if not assets:
        return 100.0
    total = sum(asset.get("integrity", 100) for asset in assets.values())
    return round(total / len(assets), 1)


def _calc_detection_rate(ai_actions: list) -> float:
    if not ai_actions:
        return 0.0
    detected = [a for a in ai_actions if a.get("detected")]
    return round((len(detected) / len(ai_actions)) * 100, 1)


def _calc_final_score(state: Dict[str, Any]) -> int:
    assets = state.get("assets", {})
    integrity = _calc_asset_integrity(assets)
    time_remaining = state.get("timeRemaining", 0)
    ai_actions = state.get("aiActions", [])
    detection = _calc_detection_rate(ai_actions)
    score = (integrity * 0.4) + (min(time_remaining / 9, 100) * 0.3) + (detection * 0.3)
    return int(round(score))


def _calc_completion_bonus(state: Dict[str, Any]) -> int:
    base_bonus = 25
    integrity = _calc_asset_integrity(state.get("assets", {}))
    time_remaining = state.get("timeRemaining", 0)
    attacks_mitigated = state.get("attacksMitigated", 0)
    attacks_successful = state.get("attacksSuccessful", 0)

    integrity_bonus = (integrity / 100) * 20
    time_bonus = min(time_remaining / INITIAL_TIME, 1) * 15
    defense_ratio = attacks_mitigated / max(1, attacks_mitigated + attacks_successful)
    defense_bonus = defense_ratio * 10

    return int(base_bonus + integrity_bonus + time_bonus + defense_bonus)


def _calc_action_xp(action: Dict[str, Any]) -> int:
    base_xp = {
        "block-ip": 10,
        "isolate-asset": 15,
        "increase-monitoring": 5,
        "patch-vulnerability": 20,
        "reset-credentials": 8,
        "firewall-rule": 12,
        "endpoint-quarantine": 18,
        "access-revoke": 10,
    }
    xp = base_xp.get(action.get("type", ""), 5)
    effectiveness = action.get("effectiveness", 0)
    return int(xp * (0.5 + (effectiveness / 100)))


class GameStateUpdate(BaseModel):
    state: Dict[str, Any]


class ActionPayload(BaseModel):
    action: str
    target: Optional[str] = None
    parameters: Dict[str, Any] = {}
    effectiveness: float = 0
    successful: bool = False


class AIActionPayload(BaseModel):
    action: Optional[str] = None
    type: Optional[str] = None
    technique: Optional[str] = None
    target: Optional[str] = None
    severity: str = "medium"
    detected: bool = False
    successful: bool = False
    sourceIP: Optional[str] = None


@router.get("/game-state")
def get_game_state(user: dict = Depends(get_current_user)):
    """Get the current BvR game state for the authenticated user."""
    return _get_state(user["id"])


@router.post("/game-state")
def update_game_state(payload: GameStateUpdate, user: dict = Depends(get_current_user)):
    """Update selected mutable fields of the current game state."""
    state = _get_state(user["id"])
    allowed = {
        "securityControls",
        "timeRemaining",
        "alerts",
        "incidents",
        "aiDifficulty",
        "currentPhase",
    }
    for key in allowed:
        if key in payload.state:
            state[key] = payload.state[key]
    _save_state(user["id"])
    return {"success": True, "message": "Game state updated"}


@router.post("/start-game")
def start_game(user: dict = Depends(get_current_user)):
    """Start a new BvR simulation session."""
    try:
        game_session = Session.start_session(
            user_id=user["id"], session_name="Blue-Team-vs-Red-Team-Mode"
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create game session")

    state = _default_state()
    state["isRunning"] = True
    state["startTime"] = datetime.now().isoformat()
    state["session_id"] = game_session.id
    _game_states[user["id"]] = state
    _save_state(user["id"])

    return {
        "success": True,
        "message": "Game started successfully",
        "gameState": state,
    }


@router.post("/player-action")
def player_action(data: ActionPayload, user: dict = Depends(get_current_user)):
    """Record a defensive player action."""
    state = _get_state(user["id"])
    if not state.get("isRunning"):
        raise HTTPException(status_code=400, detail="Game is not running")

    action = {
        "timestamp": datetime.now().isoformat(),
        "type": data.action,
        "target": data.target,
        "parameters": data.parameters,
        "effectiveness": data.effectiveness,
        "successful": data.successful,
    }
    state["playerActions"].append(action)

    if data.action == "block-ip" and data.successful and data.target:
        if data.target not in state["blockedIPs"]:
            state["blockedIPs"].append(data.target)

    xp_awarded = 0
    if data.successful:
        xp_awarded = _calc_action_xp(action)
        state["accumulatedXP"] = state.get("accumulatedXP", 0) + xp_awarded
        state["sessionXP"] = state.get("sessionXP", 0) + xp_awarded
        state["attacksMitigated"] = state.get("attacksMitigated", 0) + 1

    _save_state(user["id"])
    return {
        "success": True,
        "action": action,
        "xpAwarded": xp_awarded,
        "accumulated_xp": state["accumulatedXP"],
        "total_session_xp": state["sessionXP"],
    }


@router.post("/ai-action")
def ai_action(data: AIActionPayload, user: dict = Depends(get_current_user)):
    """Record an AI attack action and apply integrity/alert effects."""
    state = _get_state(user["id"])
    if not state.get("isRunning"):
        raise HTTPException(status_code=400, detail="Game is not running")

    action_type = data.action or data.type
    if not action_type:
        raise HTTPException(status_code=400, detail="Action type required")

    source_ip = data.sourceIP
    blocked_ips = state.get("blockedIPs", [])
    ip_blocked = source_ip in blocked_ips if source_ip else False

    action = {
        "timestamp": datetime.now().isoformat(),
        "type": action_type,
        "technique": data.technique,
        "target": data.target,
        "severity": data.severity,
        "detected": data.detected,
        "successful": data.successful and not ip_blocked,
        "sourceIP": source_ip,
        "blocked": ip_blocked,
    }
    state["aiActions"].append(action)

    if action["successful"]:
        phases = [
            "reconnaissance",
            "initial-access",
            "persistence",
            "privilege-escalation",
            "defense-evasion",
            "credential-access",
            "discovery",
            "lateral-movement",
            "collection",
            "command-and-control",
            "exfiltration",
            "impact",
        ]
        current = state.get("currentPhase", "reconnaissance")
        idx = phases.index(current) if current in phases else 0
        state["currentPhase"] = phases[min(idx + 1, len(phases) - 1)]

    if data.severity in ("critical", "high"):
        state["alerts"].append({
            "id": len(state["alerts"]) + 1,
            "severity": data.severity,
            "message": f"{action_type} detected on {data.target or 'network'}",
            "time": datetime.now().strftime("%H:%M"),
            "read": False,
        })

    xp_penalty = 0
    if action["severity"] in ("critical", "high") and action["successful"]:
        target_asset = data.target
        if target_asset and target_asset in state["assets"]:
            integrity_loss = 15 if action["severity"] == "critical" else 10
            current = state["assets"][target_asset]["integrity"]
            new_integrity = max(0, current - integrity_loss)
            state["assets"][target_asset]["integrity"] = new_integrity
            state["assets"][target_asset]["status"] = "compromised" if new_integrity < 80 else "secure"
            state["attacksSuccessful"] = state.get("attacksSuccessful", 0) + 1
            xp_penalty = 5 if action["severity"] == "critical" else 3
            state["accumulatedXP"] = max(0, state.get("accumulatedXP", 0) - xp_penalty)
            state["sessionXP"] = max(0, state.get("sessionXP", 0) - xp_penalty)

    _save_state(user["id"])
    return {
        "success": True,
        "action": action,
        "integrity_impact": action["severity"] in ("critical", "high") and action["successful"],
        "xp_penalty": xp_penalty,
        "ip_blocked": ip_blocked,
        "accumulated_xp": state["accumulatedXP"],
    }


@router.post("/stop-game")
def stop_game(user: dict = Depends(get_current_user)):
    """Stop the current game and award final XP."""
    state = _get_state(user["id"])
    if not state.get("isRunning"):
        return {
            "success": True,
            "message": "Game not running",
            "gameState": state,
        }

    state["isRunning"] = False
    state["endTime"] = datetime.now().isoformat()
    final_score = _calc_final_score(state)
    completion_bonus = _calc_completion_bonus(state)
    total_xp = state.get("accumulatedXP", 0) + completion_bonus

    session_id = state.get("session_id")
    if session_id and total_xp > 0:
        try:
            Session.end_session(session_id, score=final_score)
            XPManager.award_session_xp(
                user_id=user["id"],
                session_name="Blue-Team-vs-Red-Team-Mode",
                score=final_score,
                session_id=session_id,
                reason="Blue Team vs Red Team Mode",
            )
        except Exception:
            pass

    state["session_completed"] = True
    state["xp_awarded"] = total_xp
    state["completion_bonus"] = completion_bonus
    _save_state(user["id"])

    return {
        "success": True,
        "message": "Game stopped successfully",
        "gameState": state,
        "final_score": final_score,
        "session_completed": True,
        "xp_awarded": total_xp,
        "completion_bonus": completion_bonus,
    }


@router.post("/reset-game")
def reset_game(user: dict = Depends(get_current_user)):
    """Reset the current game to its initial state."""
    state = _get_state(user["id"])
    session_id = state.get("session_id")
    if session_id and state.get("isRunning"):
        try:
            Session.end_session(session_id, score=0)
        except Exception:
            pass

    _game_states[user["id"]] = _default_state()
    _save_state(user["id"])
    return {"success": True, "message": "Game reset successfully"}


@router.post("/exit-game")
def exit_game(user: dict = Depends(get_current_user)):
    """Handle early game exit with a reduced completion bonus."""
    state = _get_state(user["id"])
    if state.get("isRunning"):
        state["isRunning"] = False
        state["endTime"] = datetime.now().isoformat()
        final_score = _calc_final_score(state)
        partial_bonus = _calc_completion_bonus(state) // 2
        total_xp = state.get("accumulatedXP", 0) + partial_bonus

        session_id = state.get("session_id")
        if session_id:
            try:
                Session.end_session(session_id, score=final_score)
                if total_xp > 0:
                    XPManager.award_session_xp(
                        user_id=user["id"],
                        session_name="Blue-Team-vs-Red-Team-Mode",
                        score=final_score,
                        session_id=session_id,
                        reason="Early Exit",
                    )
            except Exception:
                pass

        state["session_completed"] = True
        state["xp_awarded"] = total_xp
    _save_state(user["id"])

    return {
        "success": True,
        "message": "Game exit handled successfully",
        "xp_awarded": state.get("xp_awarded", 0),
    }


@router.get("/game-results")
def game_results(user: dict = Depends(get_current_user)):
    """Return game results and statistics."""
    state = _get_state(user["id"])
    if not state:
        raise HTTPException(status_code=404, detail="No game data found")

    player_actions = state.get("playerActions", [])
    ai_actions = state.get("aiActions", [])

    stats = {
        "gameDuration": 0,
        "totalPlayerActions": len(player_actions),
        "totalAIActions": len(ai_actions),
        "attacksDetected": len([a for a in ai_actions if a.get("detected")]),
        "attacksSuccessful": len([a for a in ai_actions if a.get("successful")]),
        "attacksMitigated": state.get("attacksMitigated", 0),
        "assetIntegrity": _calc_asset_integrity(state.get("assets", {})),
        "detectionRate": _calc_detection_rate(ai_actions),
        "responseTime": round(len(player_actions) * 2.5, 1) if player_actions else 0,
        "finalScore": _calc_final_score(state),
        "sessionXP": state.get("sessionXP", 0),
        "xpPerAction": round(state.get("sessionXP", 0) / max(1, len(player_actions)), 1),
    }

    return {"success": True, "gameState": state, "statistics": stats}


@router.get("/xp-status")
def xp_status(user: dict = Depends(get_current_user)):
    """Return current session XP status."""
    state = _get_state(user["id"])
    user_total = 0
    try:
        user_total = XPHistory.calculate_user_total_xp(user["id"])
    except Exception:
        pass

    return {
        "success": True,
        "currentXP": user_total,
        "sessionXP": state.get("sessionXP", 0),
        "accumulatedXP": state.get("accumulatedXP", 0),
        "userTotalXP": user_total,
        "attacksMitigated": state.get("attacksMitigated", 0),
        "attacksSuccessful": state.get("attacksSuccessful", 0),
        "blockedIPs": len(state.get("blockedIPs", [])),
    }
