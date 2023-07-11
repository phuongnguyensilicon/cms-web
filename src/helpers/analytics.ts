export const logPageView = (): void => {
  if (typeof window !== 'undefined' && (window as any)?.gtag) {
    (window as any)?.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title || ''
    });
  }
};

export const trackButtonClick = (buttonName: string, cate: string): void => {
  if (typeof window !== 'undefined') {
    (window as any)?.gtag('event', 'button_click', {
      event_category: cate || 'Button',
      event_label: buttonName
    });
  }
};

let startTime = new Date();
export const calculateTimeOnPage = (label: string): void => {
  if (typeof window !== 'undefined') {
    const endTime = new Date();
    const timeSpent = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000
    ); // in seconds
    (window as any).gtag('event', 'time_spent', {
      event_category: 'Time',
      event_label: label || 'Time on Page',
      value: `${timeSpent} seconds`
    });
    startTime = endTime; // Reset the start time for subsequent page views
  }
};
