/**
 * Hub 사용자 ID를 ExamHub 내부 memberId로 변환
 * Hub ID: "S26H208011" → ExamHub memberId: "eh_S26H208011"
 */
export function toExamHubMemberId(hubUserId: string): string {
    if (hubUserId.startsWith('eh_')) {
        return hubUserId; // 이미 변환된 경우
    }
    return `eh_${hubUserId}`;
}
