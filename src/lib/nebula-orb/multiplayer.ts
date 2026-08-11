import { RealtimeChannel } from "@supabase/supabase-js";
import { MultiplayerUpdate, Orb } from "./types";
import { supabase } from "../supabase";

export type OnPlayerJoin = (playerId: string, data: MultiplayerUpdate) => void;
export type OnPlayerLeave = (playerId: string) => void;
export type OnPlayerUpdate = (playerId: string, data: MultiplayerUpdate) => void;

export class NebulaOrbMultiplayer {
  private channel: RealtimeChannel | null = null;
  private playerId: string = "";
  private playerName: string = "";
  private broadcastInterval: ReturnType<typeof setInterval> | null = null;

  onPlayerJoin: OnPlayerJoin | null = null;
  onPlayerLeave: OnPlayerLeave | null = null;
  onPlayerUpdate: OnPlayerUpdate | null = null;

  async join(playerId: string, playerName: string): Promise<void> {
    this.playerId = playerId;
    this.playerName = playerName;

    this.channel = supabase().channel(`nebula-orb-game`, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on("broadcast", { event: "player_update" }, ({ payload }) => {
        const data = payload as MultiplayerUpdate;
        if (data.id !== this.playerId) {
          this.onPlayerUpdate?.(data.id, data);
        }
      })
      .on("broadcast", { event: "player_join" }, ({ payload }) => {
        const data = payload as MultiplayerUpdate;
        if (data.id !== this.playerId) {
          this.onPlayerJoin?.(data.id, data);
        }
      })
      .on("broadcast", { event: "player_leave" }, ({ payload }) => {
        const data = payload as { id: string };
        if (data.id !== this.playerId) {
          this.onPlayerLeave?.(data.id);
        }
      })
      .subscribe();
  }

  broadcastState(orb: Orb): void {
    if (!this.channel) return;

    const update: MultiplayerUpdate = {
      id: orb.id,
      name: orb.name,
      x: orb.x,
      y: orb.y,
      radius: orb.radius,
      score: orb.score,
      kills: orb.kills,
      color: orb.color,
      skinId: orb.skin.id,
      alive: orb.alive,
      activePowerUps: orb.activePowerUps,
      customization: orb.customization,
    };

    this.channel.send({
      type: "broadcast",
      event: "player_update",
      payload: update,
    });
  }

  broadcastJoin(orb: Orb): void {
    if (!this.channel) return;

    const update: MultiplayerUpdate = {
      id: orb.id,
      name: orb.name,
      x: orb.x,
      y: orb.y,
      radius: orb.radius,
      score: orb.score,
      kills: orb.kills,
      color: orb.color,
      skinId: orb.skin.id,
      alive: orb.alive,
      activePowerUps: orb.activePowerUps,
      customization: orb.customization,
    };

    this.channel.send({
      type: "broadcast",
      event: "player_join",
      payload: update,
    });
  }

  broadcastLeave(): void {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "player_leave",
      payload: { id: this.playerId },
    });
  }

  leave(): void {
    this.broadcastLeave();
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
    if (this.channel) {
      supabase().removeChannel(this.channel);
      this.channel = null;
    }
  }
}
