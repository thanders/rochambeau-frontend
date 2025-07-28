import { useEffect, useRef } from "preact/hooks"; // Import useRef

export function useDataSubscription<T>(
  url: string,
  onMessage: (data: T) => void,
  deps: unknown[],
) {
  // useRef to store the EventSource instance across renders
  const eventSourceRef = useRef<EventSource | null>(null);

  // Function to establish the EventSource connection
  const connect = () => {
    // If there's an existing connection, close it first to avoid duplicates
    if (
      eventSourceRef.current &&
      eventSourceRef.current.readyState !== EventSource.CLOSED
    ) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es; // Store the new EventSource instance

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessage(data);
      } catch (e) {
        console.error(`Error parsing message from ${url}:`, e);
      }
    };

    es.onerror = (err) => {
      console.error(`EventSource error for ${url}:`, err);
      // Only attempt to close if it's not already closed to prevent infinite loops on some errors
      if (es.readyState !== EventSource.CLOSED) {
        es.close();
      }
    };

    es.onopen = () => {
      console.log(`EventSource connection opened to: ${url}`);
    };
  };

  // Function to explicitly disconnect the EventSource
  const disconnect = () => {
    if (
      eventSourceRef.current &&
      eventSourceRef.current.readyState !== EventSource.CLOSED
    ) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log(`EventSource connection closed for: ${url}`);
    }
  };

  useEffect(() => {
    // Establish connection when the component mounts or dependencies change
    connect();

    // Event handler for when the page becomes hidden
    const handlePageHide = () => {
      console.log(
        `[useDataSubscription] Page hidden. Closing EventSource for ${url}.`,
      );
      disconnect();
    };

    // Event handler for when the page becomes visible again
    const handlePageShow = () => {
      console.log(
        `[useDataSubscription] Page shown. Reconnecting EventSource for ${url}.`,
      );
      connect(); // Re-establish the connection
    };

    // Add event listeners to the global scope (window/self)
    self.addEventListener("pagehide", handlePageHide);
    self.addEventListener("pageshow", handlePageShow);

    // Cleanup function: runs when component unmounts or effect re-runs
    return () => {
      console.log(
        `[useDataSubscription] Effect cleanup. Closing EventSource for ${url}.`,
      );
      disconnect(); // Ensure connection is closed on unmount
      // Remove event listeners to prevent memory leaks
      self.removeEventListener("pagehide", handlePageHide);
      self.removeEventListener("pageshow", handlePageShow);
    };
  }, deps); // Dependencies array
}
