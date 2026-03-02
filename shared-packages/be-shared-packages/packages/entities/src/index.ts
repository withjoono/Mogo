/**
 * @geobuk/shared-entities
 * T Skool 공유 TypeORM 엔티티
 *
 * ⚠️ 중요: 이 패키지의 엔티티들은 주로 **읽기 전용**으로 사용됩니다.
 * 회원(Member) 엔티티는 메인 백엔드에서만 관리되며,
 * 다른 서비스에서는 참조용으로만 사용하세요.
 */

// Member Entities (읽기 전용)
export * from './member/member.entity';
export * from './member/member-base.entity';

// Planner Entities (각 서비스에서 확장 가능)
export * from './planner/planner-item.entity';
export * from './planner/planner-plan.entity';
export * from './planner/planner-class.entity';
export * from './planner/planner-management.entity';

// Common Base Entities
export * from './common/base.entity';
