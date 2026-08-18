"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";

/**
 * Hook that fetches data from an API endpoint and subscribes to
 * Supabase Realtime changes on a table for live updates.
 *
 * @param {string} tableName - Supabase table name to subscribe to
 * @param {string} apiUrl - API endpoint for initial data fetch
 * @param {object} options
 * @param {function} options.transform - optional transform for each DB row
 * @param {string} options.primaryKey - primary key field name (default: "id")
 * @param {object} options.filter - optional Realtime filter e.g. { column: "member_type", value: "core" }
 * @returns {{ data: Array, loading: boolean }}
 */
export default function useRealtimeTable(tableName, apiUrl, options = {}) {
  const { transform, primaryKey = "id", filter } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Initial fetch
  useEffect(() => {
    fetch(apiUrl)
      .then((r) => r.json())
      .then((result) => {
        if (Array.isArray(result)) setData(result);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  // Realtime subscription
  useEffect(() => {
    const channelName = `realtime-${tableName}-${filter?.column || "all"}-${filter?.value || "all"}`;

    let channelConfig = {
      event: "*",
      schema: "public",
      table: tableName,
    };

    // Add filter if provided
    if (filter?.column && filter?.value) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`;
    }

    const channel = supabaseBrowser
      .channel(channelName)
      .on("postgres_changes", channelConfig, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        const tx = transformRef.current;

        if (eventType === "INSERT") {
          const item = tx ? tx(newRow) : newRow;
          setData((prev) => [...prev, item]);
        } else if (eventType === "UPDATE") {
          const item = tx ? tx(newRow) : newRow;
          setData((prev) =>
            prev.map((row) =>
              row[primaryKey] === (newRow[primaryKey] || oldRow[primaryKey])
                ? item
                : row
            )
          );
        } else if (eventType === "DELETE") {
          setData((prev) =>
            prev.filter(
              (row) => row[primaryKey] !== oldRow[primaryKey]
            )
          );
        }
      })
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [tableName, primaryKey, filter?.column, filter?.value]);

  return { data, loading };
}
