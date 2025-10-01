export class ProgressBar {
    static create(currentIndex, totalArticles, classifiedCount = 0) {
        const progressPercent = totalArticles > 0 ? Math.round((classifiedCount / totalArticles) * 100) : 0;
        const progressWidth = totalArticles > 0 ? (classifiedCount / totalArticles) * 100 : 0;
        
        return `
            <div class="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 shadow-sm">
                <!-- Compact header with progress info -->
                <div class="flex justify-between items-center mb-2">
                    <span class="text-emerald-400 text-xs font-semibold">
                        Progress
                    </span>
                    <span class="text-gray-300 text-xs bg-gray-800/50 px-2 py-0.5 rounded">
                        ${classifiedCount}/${totalArticles}
                    </span>
                </div>
                
                <!-- Compact Progress Bar -->
                <div class="bg-white/20 h-2 rounded-full overflow-hidden">
                    <div class="
                        bg-gradient-to-r from-emerald-500 to-emerald-400 
                        h-full 
                        rounded-full
                        transition-all duration-300 ease-out
                    " style="width: ${progressWidth}%"></div>
                </div>
                
                <!-- Compact percentage display -->
                <div class="text-center mt-1">
                    <span class="text-emerald-300 text-xs font-medium">${progressPercent}%</span>
                </div>
            </div>
        `;
    }
}
