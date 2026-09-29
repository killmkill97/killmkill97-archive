# killmkill97 archive

개인 창작물, 생각, 개발 기록을 적어두는 작은 홈페이지.

## 구조

- `app/[[...slug]]/page.tsx`: 공개 페이지를 처리하는 catch-all 라우트
- `components/site-shell.tsx`: 헤더, 목록, 검색, 글 읽기, 목차 화면
- `lib/content.ts`: 샘플 카테고리와 글 데이터
- `app/admin/page.tsx`: ChatGPT 인증을 거치는 관리자 진입점
- `db/`, `.openai/hosting.json`: 나중에 D1 기반 저장소를 연결할 자리

현재 UI는 샘플 데이터로 동작한다. `Post` 타입의 `id`, `slug`, `title`, `category`, `tags`, `content`, `createdAt`, `updatedAt`, `coverImage` 구조를 사용하며 `content`는 Markdown 문자열이다. `\\[ ... \\]` 또는 `$$ ... $$` 수식은 MathJax로 표시된다.

실제 운영 저장소는 교체 가능한 경계로 남겨두었다. Sites에 배포할 경우 D1을 `DB`로 연결하고 같은 shape을 반환하는 repository를 추가하는 방식이 가장 단순하다. Firebase Firestore를 사용하고 싶다면 같은 repository 인터페이스 뒤에 Firestore adapter를 붙이면 된다. 관리자 secret이나 Firebase private key는 클라이언트에 넣지 않는다.

관리자 페이지는 `/admin`이며 ChatGPT 로그인 후 서버의 `ADMIN_EMAILS` 환경값(쉼표 구분)에 포함된 사용자만 허용하도록 확장한다. 공개 읽기와 관리자 쓰기를 분리하고 삭제/수정은 서버에서 다시 권한을 확인해야 한다.

```bash
pnpm install --lockfile=false
pnpm dev
```
