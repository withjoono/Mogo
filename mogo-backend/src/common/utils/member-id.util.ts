/**
 * Hub 사용자 ID를 Mogo(모의) 내부 memberId로 변환
 * Hub ID: "S26H208011" → Mogo memberId: "mg_S26H208011"
 */
export function toMogoMemberId(hubUserId: string): string {
    if (hubUserId.startsWith('mg_')) {
        return hubUserId; // 이미 변환된 경우
    }
    return `mg_${hubUserId}`;
}
