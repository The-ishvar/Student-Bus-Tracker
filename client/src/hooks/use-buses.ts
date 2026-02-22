import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type Bus = z.infer<typeof api.buses.list.responses[200]>[0];
type InsertBus = z.infer<typeof api.buses.create.input>;

export function useBuses() {
  return useQuery({
    queryKey: [api.buses.list.path],
    queryFn: async () => {
      const res = await fetch(api.buses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch buses");
      return api.buses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBus) => {
      const res = await fetch(api.buses.create.path, {
        method: api.buses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create bus");
      return api.buses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buses.list.path] });
    },
  });
}

export function useUpdateBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertBus> & { id: number }) => {
      const url = buildUrl(api.buses.update.path, { id });
      const res = await fetch(url, {
        method: api.buses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update bus");
      return api.buses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buses.list.path] });
    },
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.buses.delete.path, { id });
      const res = await fetch(url, {
        method: api.buses.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete bus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buses.list.path] });
    },
  });
}
