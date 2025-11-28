
export const PLAN_LIMITS: { [key: string]: number } = {
    artist: 8000,
    magic: 13000,
    special: 18000,
    king: 29000,
};

export function getPlanLimits(role: string): number {
    return PLAN_LIMITS[role] || 0;
}
