import { User } from '../models/User';
import { redis } from '../config/redis';

interface FocusSession {
  taskId: string;
  duration: number; // in minutes
  startedAt: Date;
  endsAt: Date;
  isActive: boolean;
}

class FocusModeService {
  async startFocusMode(
    userId: string,
    taskId: string,
    duration: number = 25 // Default Pomodoro
  ): Promise<FocusSession> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const focusSession: FocusSession = {
      taskId,
      duration,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + duration * 60 * 1000),
      isActive: true
    };

    // Store in Redis for quick access
    await redis.setEx(
      `focus:${userId}`,
      duration * 60,
      JSON.stringify(focusSession)
    );

    return focusSession;
  }

  async getFocusStatus(userId: string): Promise<FocusSession | null> {
    const cached = await redis.get(`focus:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async endFocusMode(userId: string): Promise<void> {
    await redis.del(`focus:${userId}`);
  }
}

export const focusModeService = new FocusModeService();
