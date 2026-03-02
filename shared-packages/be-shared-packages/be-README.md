# T Skool 공유 패키지 (Geobuk Shared Packages)

T Skool 마이크로서비스 아키텍처를 위한 공유 패키지 모노레포입니다.

## 📦 패키지 목록

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `@geobuk/shared-types` | 공유 타입 정의 (인터페이스, enum, DTO) | 1.0.0 |
| `@geobuk/shared-entities` | 공유 TypeORM 엔티티 | 1.0.0 |
| `@geobuk/common-utils` | 공통 유틸리티 (JWT, bcrypt, 헬퍼) | 1.0.0 |

## 🚀 빠른 시작

### 설치

```bash
# 모노레포 설치
cd shared-packages
yarn install

# 전체 빌드
yarn build
```

### 개별 서비스에서 사용

```bash
# npm 레지스트리 사용 시
yarn add @geobuk/shared-types @geobuk/shared-entities @geobuk/common-utils

# 로컬 개발 시 (yarn link)
cd shared-packages/packages/types && yarn link
cd shared-packages/packages/entities && yarn link
cd shared-packages/packages/utils && yarn link

# 서비스에서 링크
cd your-service
yarn link @geobuk/shared-types
yarn link @geobuk/shared-entities
yarn link @geobuk/common-utils
```

## 📁 구조

```
shared-packages/
├── package.json              # 모노레포 설정
├── tsconfig.base.json        # 공통 TypeScript 설정
├── README.md
└── packages/
    ├── types/                # @geobuk/shared-types
    │   ├── src/
    │   │   ├── api/          # API 응답 타입
    │   │   ├── member/       # 회원 관련 타입
    │   │   ├── planner/      # 플래너 관련 타입
    │   │   └── common/       # 공통 타입
    │   └── package.json
    │
    ├── entities/             # @geobuk/shared-entities
    │   ├── src/
    │   │   ├── member/       # 회원 엔티티 (읽기 전용)
    │   │   ├── planner/      # 플래너 엔티티
    │   │   └── common/       # 기본 엔티티
    │   └── package.json
    │
    └── utils/                # @geobuk/common-utils
        ├── src/
        │   ├── jwt/          # JWT 서비스
        │   ├── bcrypt/       # 비밀번호 해싱
        │   ├── validation/   # 검증 유틸리티
        │   └── helpers/      # 헬퍼 함수
        └── package.json
```

## 📖 사용 가이드

### @geobuk/shared-types

타입과 인터페이스 정의를 공유합니다.

```typescript
import {
  MemberBase,
  MemberRole,
  MemberType,
  ApiResponse,
  PaginationParams,
  PlannerItemBase,
} from '@geobuk/shared-types';

// 회원 타입 사용
const member: MemberBase = {
  id: 1,
  email: 'test@example.com',
  memberType: MemberType.STUDENT,
  memberRole: MemberRole.USER,
  // ...
};

// API 응답 타입
const response: ApiResponse<MemberBase> = {
  success: true,
  data: member,
};
```

### @geobuk/shared-entities

TypeORM 엔티티를 공유합니다.

⚠️ **주의**: `MemberEntity`는 **읽기 전용**입니다. 회원 데이터의 수정은 메인 백엔드에서만 수행하세요.

```typescript
import {
  MemberEntity,
  PlannerItemEntity,
  PlannerPlanEntity,
} from '@geobuk/shared-entities';

// TypeORM 모듈에 엔티티 등록
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,        // 읽기 전용
      PlannerItemEntity,   // 읽기/쓰기 가능
      PlannerPlanEntity,
    ]),
  ],
})
export class PlannerModule {}

// Repository에서 사용
@Injectable()
export class PlannerService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @InjectRepository(PlannerItemEntity)
    private readonly plannerItemRepository: Repository<PlannerItemEntity>,
  ) {}

  async getMemberInfo(memberId: number) {
    // 읽기만 가능
    return this.memberRepository.findOne({
      where: { id: memberId },
      select: ['id', 'email', 'nickname', 'memberType'],
    });
  }
}
```

### @geobuk/common-utils

JWT, bcrypt, 헬퍼 함수를 공유합니다.

```typescript
import {
  JwtService,
  BcryptService,
  hashPassword,
  comparePassword,
  isValidEmail,
  formatKoreanDate,
  createPaginatedResponse,
} from '@geobuk/common-utils';

// JWT 서비스
const jwtService = new JwtService({
  accessSecret: process.env.AUTH_JWT_SECRET,
  refreshSecret: process.env.AUTH_REFRESH_SECRET,
});

const tokens = jwtService.generateTokens(memberId);
const result = jwtService.verifyAccessToken(token);

// 비밀번호 해싱
const hashed = await hashPassword('myPassword123');
const isValid = await comparePassword('myPassword123', hashed);

// 검증
if (!isValidEmail(email)) {
  throw new BadRequestException('이메일 형식이 올바르지 않습니다.');
}

// 날짜 포맷팅
const koreanDate = formatKoreanDate(new Date()); // 2024. 12. 17.

// 페이지네이션
const response = createPaginatedResponse(items, totalCount, { page: 1, limit: 10 });
```

## 🔧 개발

### 새 타입 추가

1. `packages/types/src/` 에 파일 생성
2. `packages/types/src/index.ts` 에 export 추가
3. 빌드 및 테스트

### 새 엔티티 추가

1. `packages/entities/src/` 에 엔티티 파일 생성
2. `packages/entities/src/index.ts` 에 export 추가
3. 필요시 마이그레이션 SQL 준비

### 새 유틸리티 추가

1. `packages/utils/src/` 에 파일 생성
2. `packages/utils/src/index.ts` 에 export 추가
3. 테스트 작성

### 빌드

```bash
# 전체 빌드
yarn build

# 개별 패키지 빌드
cd packages/types && yarn build
```

## 📋 체크리스트

### 새 서비스에서 사용 시

- [ ] 패키지 설치 또는 링크
- [ ] TypeORM 엔티티 등록
- [ ] 환경 변수 설정 (JWT 시크릿 공유)
- [ ] 타입 import 확인

### 패키지 수정 시

- [ ] 하위 호환성 유지
- [ ] 타입 변경 시 모든 서비스 영향 확인
- [ ] 버전 업데이트
- [ ] CHANGELOG 작성

## 🔗 관련 문서

- [통합 가이드](../docs/INTEGRATION-GUIDE.md)
- [DB 스키마](../docs/DATABASE-SCHEMA.md)
- [플래너 DB 가이드](../docs/PLANNER-DB-GUIDE.md)

## 📞 문의

패키지 관련 문의는 메인 백엔드 담당자에게 연락하세요.
