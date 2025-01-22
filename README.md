## Instagram Clone 프로젝트

## 프로젝트 소개

이 프로젝트는 Instagram의 주요 기능을 클론하여 구현한 웹 애플리케이션입니다. 사용자는 사진 및 동영상을 공유하고, 다른 사용자를 팔로우하며, 채팅 기능과 댓글을 통해 상호작용할 수 있습니다.

## 주요 기능

- **회원가입 및 로그인**
  - 이메일 인증 및 소셜 로그인(Kakao OAuth2) 지원
  - JWT 기반 인증 및 쿠키 관리
- **게시물 기능**
  - 이미지 및 동영상 업로드
  - 게시물 수정 및 삭제
  - 게시물에 댓글 작성 및 좋아요 기능
- **팔로우 및 팔로워 관리**
  - 사용자를 팔로우 및 언팔로우
  - 팔로워 및 팔로잉 리스트 확인
- **실시간 채팅**
  - Socket.IO를 이용한 실시간 채팅 구현
  - 새로운 채팅방 생성 및 기존 채팅방 관리
- **검색 기능**
  - 닉네임을 기반으로 사용자 검색
  - 검색 결과에서 프로필 페이지로 이동
- **소셜 로그인**
  - 카카오 소셜 로그인을 통해 사용자 인증

## 기술 스택

### Backend

- **Node.js**: 서버 런타임 환경
- **Express**: 라우팅 및 REST API 구현
- **MongoDB & Mongoose**: 데이터베이스 및 데이터 모델링
- **AWS S3**: 이미지 및 동영상 업로드 저장소
- [**Socket.IO**](http://socket.io/): 실시간 채팅 기능
- **JWT**: 인증 및 세션 관리
- **Nodemailer**: 이메일 인증 기능
- **Kakao OAuth2**: 소셜 로그인 지원

### Frontend

- **React**: 사용자 인터페이스 구현
- **React Router**: 페이지 라우팅
- **Axios**: API 호출

### DevOps

- **Render**: 클라이언트와 서버 배포
- **Concurrently**: 백엔드와 프론트엔드 동시 실행

## 설치 및 실행 방법

### 로컬 개발 환경

1. **레포지토리 클론**

   ```bash
   git clone <https://github.com/username/instagram-clone.git>
   cd instagram-clone

   ```

2. **백엔드 의존성 설치**

   ```bash
   npm install

   ```

3. **프론트엔드 의존성 설치**

   ```bash
   cd client
   npm install

   ```

4. **환경 변수 설정**
   - 루트 디렉토리에 `.env` 파일을 생성하고 다음과 같은 내용을 추가하세요:
     ```
     PORT=5000
     MONGO_URI=<MongoDB 연결 URI>
     JWT_SECRET=<JWT 비밀키>
     AWS_ACCESS_KEY_ID=<AWS 키>
     AWS_SECRET_ACCESS_KEY=<AWS 시크릿 키>
     AWS_BUCKET_NAME=<AWS S3 버킷 이름>
     CLIENT_URL=https://instagram-clone-client-lr01.onrender.com
     SERVER_URL=https://instagram-clone-ztsr.onrender.com
     KAKAO_CLIENT_ID=<Kakao OAuth2 Client ID>
     KAKAO_CLIENT_SECRET=<Kakao OAuth2 Client Secret>
     KAKAO_REDIRECT_URI=http://localhost:5000/auth/kakao/callback

     ```
5. **애플리케이션 실행**

   ```bash
   npm run dev

   ```

   - `http://localhost:3000`에서 클라이언트 실행
   - `http://localhost:5001`에서 서버 실행

## 배포

### Render를 이용한 배포

1. **클라이언트**
   - `client` 폴더를 Render에 배포
   - 빌드 명령: `npm run build`
   - 시작 명령: `npx serve -s build`
2. **서버**
   - 루트 디렉토리를 Render에 배포
   - 시작 명령: `npm start`

## Safari에서 경고 메시지 표시

Safari 브라우저에서는 Cross-Site Tracking 방지 설정을 비활성화해야 쿠키 저장 문제가 해결됩니다. 이 설정을 비활성화하려면 아래의 단계를 따르세요:

1. Safari 브라우저 열기
2. 상단 메뉴에서 **환경설정** 클릭
3. **개인 정보 보호** 탭으로 이동
4. **웹사이트 간 추적 방지 방지** 항목의 체크를 해제

---

배포된 URL: [https://instagram-clone-client-lr01.onrender.com](https://instagram-clone-client-lr01.onrender.com/)
