
export const PLAN_LIMITS: { [key: string]: number } = {
    artist: 8000,
    magic: 12500,
    special: 19000,
    king: 33000,
};

export function getPlanLimits(role: string): number {
    return PLAN_LIMITS[role] || 0;
}
