# System Test Plan - Home Page

## Test Case 1: Home Page Load

| **Test Plan No:** | STP-001-01 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.1: Home Page |
| **Description / Scenario** | Verify that the home page loads correctly when accessing the root URL |
| **Expected Results** | Display the complete home page with hero section, features, learning modules, and CTA sections |
| **Procedure** | 1. Open web browser <br> 2. Navigate to `http://localhost:5000/` <br> 3. Verify page loads completely <br> 4. Check all sections are visible (Hero, Features, Learning Modules, CTA) |
| **Remarks** | Passed |

---

## Test Case 2: Navigation to Levels (Authenticated User)

| **Test Plan No:** | STP-001-02 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.2: Home Page CTA - Authenticated |
| **Description / Scenario** | Verify authenticated user can navigate to levels overview from home page |
| **Expected Results** | User is redirected to levels overview page when clicking "Start Learning" or "Continue Learning" |
| **Procedure** | 1. Login as authenticated user <br> 2. Navigate to home page <br> 3. Click "Start Learning" or "Continue Learning" button <br> 4. Verify redirection to levels overview |
| **Remarks** | Passed |

---

## Test Case 3: Navigation to Signup (Unauthenticated User)

| **Test Plan No:** | STP-001-03 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.3: Home Page CTA - Unauthenticated |
| **Description / Scenario** | Verify unauthenticated user is directed to signup from home page |
| **Expected Results** | User is redirected to signup page when clicking "Get Started" |
| **Procedure** | 1. Ensure user is not logged in <br> 2. Navigate to home page <br> 3. Click "Get Started" button <br> 4. Verify redirection to signup page |
| **Remarks** | Passed |

---

## Test Case 4: About Page Navigation

| **Test Plan No:** | STP-001-04 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.4: Home Page About Link |
| **Description / Scenario** | Verify navigation to about page from home page |
| **Expected Results** | User is redirected to about page when clicking "Learn More" |
| **Procedure** | 1. Navigate to home page <br> 2. Click "Learn More" button in hero section <br> 3. Verify redirection to `/about` page <br> 4. Confirm about page content loads |
| **Remarks** | Passed |

---

## Test Case 5: Dark Mode Toggle

| **Test Plan No:** | STP-001-05 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.5: Home Page Dark Mode |
| **Description / Scenario** | Verify dark mode functionality on home page |
| **Expected Results** | Page theme changes to dark mode with appropriate color scheme |
| **Procedure** | 1. Navigate to home page <br> 2. Click dark mode toggle (if available) <br> 3. Verify background changes to dark theme <br> 4. Check text colors are readable in dark mode |
| **Remarks** | Passed |

---

## Test Case 6: Responsive Design - Mobile View

| **Test Plan No:** | STP-001-06 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.6: Home Page Mobile |
| **Description / Scenario** | Verify home page displays correctly on mobile devices |
| **Expected Results** | Page layout adapts to mobile screen with readable text and functional buttons |
| **Procedure** | 1. Open browser developer tools <br> 2. Set viewport to mobile size (375x667) <br> 3. Navigate to home page <br> 4. Verify responsive layout and button accessibility |
| **Remarks** | Pending |

---

## Test Case 7: Learning Module Cards Display

| **Test Plan No:** | STP-001-07 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.7: Learning Modules Section |
| **Description / Scenario** | Verify all learning module cards are displayed correctly |
| **Expected Results** | Six learning module cards displayed with icons, titles, and descriptions |
| **Procedure** | 1. Navigate to home page <br> 2. Scroll to "Cybersecurity Game Scenarios" section <br> 3. Verify all 6 cards are visible: Email Detective, Truth Seeker, Privacy Guardian, Vault Keeper, Cyber Fortress, White Hat Academy <br> 4. Check icons and text are properly displayed |
| **Remarks** | Pending |

---

## Test Case 8: Features Section Display

| **Test Plan No:** | STP-001-08 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.8: Features Section |
| **Description / Scenario** | Verify features section displays correctly with animations |
| **Expected Results** | Three feature cards displayed with icons and hover effects |
| **Procedure** | 1. Navigate to home page <br> 2. Scroll to "Learning Features" section <br> 3. Verify three cards: Gamified Learning, AI Mentoring, Real Scenarios <br> 4. Test hover effects on cards |
| **Remarks** | Pending |

---

## Test Case 9: Hero Section Animation

| **Test Plan No:** | STP-001-09 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.9: Hero Section |
| **Description / Scenario** | Verify hero section loads with proper animations and floating elements |
| **Expected Results** | Hero text fades in with staggered animation, floating cyber elements visible |
| **Procedure** | 1. Navigate to home page <br> 2. Observe hero section load <br> 3. Verify "Welcome to Phalanx Cyber Academy" text animates in <br> 4. Check floating colored circles are animated |
| **Remarks** | Pending |

---

## Test Case 10: CTA Section for Unauthenticated Users

| **Test Plan No:** | STP-001-10 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.10: CTA Section Unauthenticated |
| **Description / Scenario** | Verify CTA section shows signup and login options for unauthenticated users |
| **Expected Results** | "Get Started" and "Sign In" buttons displayed in CTA section |
| **Procedure** | 1. Ensure user is logged out <br> 2. Navigate to home page <br> 3. Scroll to bottom CTA section <br> 4. Verify "Get Started" and "Sign In" buttons are present <br> 5. Test both button links |
| **Remarks** | Pending |

---

## Test Case 11: CTA Section for Authenticated Users

| **Test Plan No:** | STP-001-11 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.11: CTA Section Authenticated |
| **Description / Scenario** | Verify CTA section shows continue learning option for authenticated users |
| **Expected Results** | "Continue Learning" button displayed in CTA section for logged-in users |
| **Procedure** | 1. Login as authenticated user <br> 2. Navigate to home page <br> 3. Scroll to bottom CTA section <br> 4. Verify "Continue Learning" button is present <br> 5. Test button redirects to levels overview |
| **Remarks** | Pending |

---

## Test Case 12: Page Performance and Loading

| **Test Plan No:** | STP-001-12 |
|-------------------|------------|
| **Screen Design Ref No** | Figure 2.12: Home Page Performance |
| **Description / Scenario** | Verify home page loads within acceptable time and resources |
| **Expected Results** | Page loads within 3 seconds and CSS/JS files load correctly |
| **Procedure** | 1. Clear browser cache <br> 2. Open browser developer tools Network tab <br> 3. Navigate to home page <br> 4. Verify page load time under 3 seconds <br> 5. Check all CSS and JS files load successfully |
| **Remarks** | Pending |
