
export const PLAN_LIMITS: { [key: string]: number } = {
    artist: 12000,
    magic: 19000,
    special: 30000,
    king: 55000,
};

export function getPlanLimits(role: string): number {
    return PLAN_LIMITS[role] || 0;
}

    