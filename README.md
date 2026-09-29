# killmkill97의 개인 사이트

개인 창작물, 생각, 개발 기록을 편하게 적어두는 작은 홈페이지다. 전문 포트폴리오나 뉴스 사이트보다 개인 홈페이지와 아카이브에 가깝게 구성했다.

## 실행

```bash
pnpm install --lockfile=false
pnpm dev
```

빌드 확인:

```bash
node node_modules/typescript/bin/tsc --noEmit
node scripts/run-framework.mjs build
```

## 주요 구조

- `app/[[...slug]]/page.tsx`: 홈, 모든 글, 목차, 소개, 카테고리, 글 페이지
- `app/admin/page.tsx`: 관리자 진입점
- `components/site-shell.tsx`: 공개 화면과 Firebase 기반 글 작성기
- `components/mathjax-loader.tsx`: hydration 이후 MathJax 로더
- `lib/content.ts`: 화면에서 사용하는 글/카테고리 타입과 샘플 데이터
- `lib/content-store.ts`: Firestore 읽기/쓰기 경계
- `lib/firebase.ts`: Firebase 앱, Auth, Firestore 초기화
- `firestore.rules`: 공개 읽기와 관리자 쓰기를 분리하는 규칙
- `.openai/hosting.json`: Sites 프로젝트 연결 정보

글의 `content`는 Markdown 문자열이다. 제목, 굵은 글씨, 링크, 이미지, 코드 블록, 인용문, 목록, 인라인/블록 수식을 사용할 수 있다. 수식은 `\\[ ... \\]`, `$$ ... $$`, `\\( ... \\)` 또는 `$ ... $` 형식으로 적는다.

## Firebase 연결

로컬에서는 `.env.local`에 Firebase 웹 설정을 넣는다. 이 값은 브라우저용 Firebase 설정이라 공개될 수 있지만, 관리자용 secret이나 서비스 계정 키는 절대 넣지 않는다. 배포할 때는 같은 `NEXT_PUBLIC_FIREBASE_*` 변수들을 호스팅 환경 변수에도 등록해야 한다.

필요한 변수 이름은 `.env.example`에 있다.

Firebase Console에서 다음을 차례로 한다.

1. Authentication → Sign-in method → Google을 활성화한다.
2. Firestore Database → Rules에 `firestore.rules` 내용을 배포한다.
3. 사이트에서 `/admin`으로 들어가 Google 로그인한다.
4. 처음 로그인하면 화면에 나온 UID를 복사한다.
5. Firestore의 `admins` 컬렉션에 문서를 만들고 문서 ID를 UID와 똑같이 설정한다.
6. 그 문서에 `enabled` 필드를 Boolean `true`로 추가한다.

`admins` 문서는 관리자만 읽을 수 있고 클라이언트에서는 작성할 수 없게 해두었다. 따라서 첫 관리자 등록은 Firebase Console에서 직접 해야 한다.

관리자 권한이 확인되면 `/admin`에서 제목, slug, 카테고리, 태그, 대표 이미지 URL, Markdown 본문을 작성하고 미리보기/게시/수정/삭제를 할 수 있다. 공개 글은 `posts` 컬렉션에 저장되며 `createdAt` 기준으로 최신순 정렬된다.

## 카테고리

현재 샘플 카테고리는 `lib/content.ts`의 `categories` 데이터로 관리한다. Firestore에 `categories` 문서를 넣으면 공개 화면은 Firestore 카테고리를 사용한다. 문서 필드는 최소한 다음 형태를 맞추면 된다.

```json
{
  "name": "수학",
  "description": "거대수와 수학 관련 기록",
  "accent": "#d86a45",
  "parentId": null
}
```

하위 카테고리는 `parentId`에 부모 카테고리 문서 ID를 넣는다. 새 글의 카테고리 선택지는 현재 불러온 카테고리 목록을 사용한다.

## 샘플 데이터

Firebase에 글/카테고리가 아직 없거나 연결에 실패하면 UI 확인을 위해 `lib/content.ts`의 샘플 데이터가 표시된다. 실제 운영을 시작한 뒤 샘플을 숨기고 싶으면 `lib/content-store.ts`의 빈 데이터 fallback을 제거하면 된다.

댓글 시스템은 구현하지 않았다. 글 하단의 안내 문구만 있고 실제 댓글창은 없다.
