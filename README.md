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

GitHub Pages용 정적 빌드는 다음 명령으로 확인한다.

```bash
pnpm build:github-pages
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

## GitHub Pages 배포

`main`에 푸시하면 `.github/workflows/github-pages.yml`이 정적 사이트를 빌드하고 GitHub Pages에 배포한다. 저장소 주소가 하위 경로를 쓰므로 빌드 경로는 `/killmkill97-archive/`로 설정되어 있다. 글/카테고리는 브라우저에서 Firestore를 읽고, 관리자 글쓰기도 기존 Firebase 로그인을 사용한다.

처음 한 번은 GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 `GitHub Actions`로 설정한다. 그리고 **Settings → Secrets and variables → Actions → New repository secret**에서 `.env.local`의 Firebase 웹 설정 여섯 값을 같은 이름으로 등록한다.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

이 값들은 브라우저용 설정이라 배포 결과에서는 공개된다. 저장소 소스에 직접 적지 않기 위해 Actions secrets로 전달하며, 관리자 비밀번호나 서비스 계정 키를 여기에 넣으면 안 된다. Firebase Authentication의 승인된 도메인에도 `killmkill97.github.io`를 추가해야 Google 로그인이 동작한다.

## Firebase 연결

로컬에서는 `.env.local`에 Firebase 웹 설정을 넣는다. 이 값은 브라우저용 Firebase 설정이라 공개될 수 있지만, 관리자용 secret이나 서비스 계정 키는 절대 넣지 않는다.

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

## 카테고리와 목차

상위 카테고리는 Firestore의 `categories` 컬렉션에서 관리한다. 문서 필드는 최소한 다음 형태를 맞추면 된다.

```json
{
  "name": "수학",
  "description": "거대수와 수학 관련 기록",
  "accent": "#d86a45",
  "parentId": null
}
```

목차의 하위 분류는 카테고리 문서에 미리 만들지 않는다. 공개 글의 `tags`를 카테고리별로 모아 자동 생성한다. 예를 들어 `Numerical Ascension` 카테고리 글에 `개발` 태그를 붙이면 목차에 `Numerical Ascension → 개발`이 나타나고, 누르면 해당 태그 글만 모아본다. 새 태그도 글 작성 시 입력하면 자동으로 생기므로 별도의 DB 수정이 필요 없다.

예전 하위 카테고리 문서에서 쓰던 `parentId`도 기존 글 호환을 위해 읽지만, 목차의 태그 분류를 만드는 데 사용하지 않는다. 새 글은 상위 카테고리를 선택하고 태그로 세부 주제를 적는 방식으로 정리한다.

## 샘플 데이터

Firebase에 글/카테고리가 아직 없거나 연결에 실패하면 UI 확인을 위해 `lib/content.ts`의 샘플 데이터가 표시된다. 실제 운영을 시작한 뒤 샘플을 숨기고 싶으면 `lib/content-store.ts`의 빈 데이터 fallback을 제거하면 된다.

댓글 시스템은 구현하지 않았다. 글 하단의 안내 문구만 있고 실제 댓글창은 없다.
