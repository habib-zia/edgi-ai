import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportTop = scrollPosition;
      const viewportBottom = scrollPosition + windowHeight;
      const viewportCenter = scrollPosition + (windowHeight / 2);
        
      // Find which section is most prominently visible in the viewport
      let bestSection = '';
      let bestScore = -1;
      
      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const element = document.getElementById(sectionId);
        
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          const elementCenter = elementTop + (element.offsetHeight / 2);
          
          // Calculate how much of this section is visible in the viewport
          const visibleTop = Math.max(elementTop, viewportTop);
          const visibleBottom = Math.min(elementBottom, viewportBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          
          // Calculate a score based on visibility and proximity to viewport center
          const visibilityRatio = visibleHeight / element.offsetHeight;
          const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
          const score = visibilityRatio - (distanceFromCenter / windowHeight) * 0.1;
          
          if (score > bestScore) {
            bestScore = score;
            bestSection = sectionId;
          }
        }
      }
      
      // Only set active section if we found a section with reasonable visibility
      if (bestScore > 0.1) {
        setActiveSection(bestSection);
      }
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener with throttling
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}
