export class ProgressBar {
    static create(currentIndex, totalArticles, classifiedCount = 0) {
        const progressPercent = totalArticles > 0 ? Math.round((classifiedCount / totalArticles) * 100) : 0;
        const progressWidth = totalArticles > 0 ? (classifiedCount / totalArticles) * 100 : 0;
        
        return `
            <div class="bg-white/10 backdrop-blur-sm rounded p-3 sm:p-4 border border-white border-opacity-20">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                    <div class="text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
                        Classification Progress
                    </div>
                    <span class="text-gray-300 text-xs font-medium bg-gray-800/50 px-2 py-1 rounded self-start sm:self-auto sm:ml-2">
                        ${classifiedCount} of ${totalArticles} classified
                    </span>
                </div>
                
                <!-- Progress Bar Container -->
                <div class="bg-white/20 h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div class="
                        bg-gradient-to-r from-emerald-500 to-emerald-400 
                        h-full 
                        rounded-full
                        transition-all duration-300 ease-out
                        shadow-sm
                    " style="width: ${progressWidth}%"></div>
                </div>
                
                <!-- Progress Percentage -->
                <div class="text-gray-400 text-xs text-center mt-2 font-medium">
                    <span class="text-emerald-300">${progressPercent}%</span>
                    Complete
                </div>
            </div>
        `;
    }
}
