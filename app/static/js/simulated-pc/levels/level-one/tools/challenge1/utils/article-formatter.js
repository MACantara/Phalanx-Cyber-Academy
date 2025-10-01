export class ArticleFormatter {
    static formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original if parsing fails
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString; // Return original on error
        }
    }

    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        
        // Truncate at word boundary
        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        return truncated.substring(0, lastSpace) + '...';
    }

    static toTitleCase(str) {
        // Return the original string without modification to preserve original formatting
        return str;
    }

    static formatArticleText(text, isFakeNews, articleData = null) {
        // Get content analysis from AI data if available
        const contentAnalysis = articleData?.ai_analysis?.clickable_elements?.find(
            el => el.element_id === 'content_analysis'
        );
        
        // Split text into paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        
        return paragraphs.map(paragraph => {
            let formattedParagraph = paragraph.trim();
            
            // Capitalize the first letter
            if (formattedParagraph.length > 0) {
                formattedParagraph = formattedParagraph.charAt(0).toUpperCase() + formattedParagraph.slice(1);
            }
            
            return `<p style="margin: 0 0 16px 0; text-align: justify;">${formattedParagraph}</p>`;
        }).join('');
    }

    static getElementAnalysis(articleData, elementType) {
        if (!articleData?.ai_analysis?.clickable_elements) {
            return null;
        }
        
        const elementIdMap = {
            'title': 'title_analysis',
            'author': 'author_analysis', 
            'content': 'content_analysis',
            'date': 'date_analysis',
            'source': 'source_analysis'
        };
        
        const elementId = elementIdMap[elementType];
        return articleData.ai_analysis.clickable_elements.find(
            el => el.element_id === elementId
        );
    }

    static formatWithAnalysis(text, elementType, articleData) {
        const analysis = this.getElementAnalysis(articleData, elementType);
        
        if (analysis) {
            const isExpectedFake = analysis.expected_label === 'fake';
            const reasoning = analysis.reasoning || '';
            
            // Add subtle visual cues based on analysis
            const dataAttrs = `data-analysis-available="true" data-expected-label="${analysis.expected_label}" title="${reasoning}"`;
            
            if (isExpectedFake) {
                return `<span ${dataAttrs} style="position: relative;">${text}</span>`;
            } else {
                return `<span ${dataAttrs}>${text}</span>`;
            }
        }
        
        return text;
    }
}
