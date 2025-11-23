# 🚀 QuestLog 배포 가이드 (Vercel)

이 가이드는 **QuestLog** 앱을 인터넷에 배포하여 가족들이 각자의 스마트폰에서 접속할 수 있도록 하는 방법을 설명합니다. **Vercel**이라는 무료 호스팅 서비스를 사용합니다.

## 1단계: GitHub에 코드 올리기 (상세 가이드)
GitHub는 내 컴퓨터에 있는 코드를 인터넷 저장소(Repository)에 올리는 곳입니다.

### 1-1. GitHub 저장소 만들기
1. [GitHub 홈페이지](https://github.com/)에 로그인합니다.
2. 우측 상단의 **+** 버튼을 누르고 **"New repository"**를 클릭합니다.
3. **Repository name**에 `QuestLog`라고 입력합니다.
4. **Public** (공개) 또는 **Private** (비공개) 중 하나를 선택합니다. (무료 배포를 위해 Public 추천)
5. 다른 건 건드리지 말고 맨 아래 **"Create repository"** 버튼을 클릭합니다.
6. 화면에 나오는 주소(예: `https://github.com/아이디/QuestLog.git`)를 복사해 둡니다.

### 1-2. 내 컴퓨터에서 업로드하기
VS Code의 **터미널**을 열고(`Ctrl + J` 또는 `Cmd + J`), 아래 명령어들을 **한 줄씩** 입력하고 엔터를 치세요.

```bash
# 1. 깃(Git) 시작하기
git init

# 2. 모든 파일을 담기
git add .

# 3. 설명과 함께 저장하기
git commit -m "첫 번째 버전 완성"

# 4. GitHub 저장소와 연결하기 (아래 주소를 아까 복사한 본인 주소로 바꾸세요!)
git remote add origin https://github.com/본인아이디/QuestLog.git

# 5. GitHub로 쏘아 올리기
git push -u origin main
```

> **주의**: 만약 `git` 명령어가 없다고 나오면 [Git 설치하기](https://git-scm.com/downloads)에서 다운로드 후 설치해주세요.
> **로그인 창이 뜨면**: GitHub 아이디와 비밀번호(또는 토큰)로 로그인하면 됩니다.

## 2단계: Vercel 가입 및 프로젝트 가져오기
1. [Vercel 홈페이지](https://vercel.com/)에 접속하여 **"Sign Up"**을 클릭합니다.
2. **"Continue with GitHub"**를 선택하여 로그인합니다.
3. 대시보드에서 **"Add New..."** -> **"Project"**를 클릭합니다.
4. `Import Git Repository` 목록에서 `QuestLog` (또는 저장소 이름) 옆의 **"Import"** 버튼을 클릭합니다.

## 3단계: 환경 변수 설정 (중요!) 🔑
배포 설정 화면(`Configure Project`)에서 **Environment Variables** 섹션을 찾습니다. 여기가 가장 중요합니다!

1. **Environment Variables**를 클릭하여 펼칩니다.
2. `.env` 파일에 있는 내용을 그대로 옮겨 적어야 합니다.
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: (Supabase 프로젝트 URL 붙여넣기)
   - **Add** 버튼 클릭
3. 하나 더 추가합니다.
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: (Supabase Anon Key 붙여넣기)
   - **Add** 버튼 클릭

## 4단계: 배포 시작
1. 모든 설정이 끝났으면 하단의 **"Deploy"** 버튼을 클릭합니다.
2. 배포가 진행되는 동안 잠시 기다립니다 (약 1~2분).
3. 폭죽이 터지며 "Congratulations!" 화면이 나오면 성공입니다! 🎉

## 5단계: 앱 설치 및 공유
1. 생성된 **Domain** (예: `questlog-xyz.vercel.app`)을 복사합니다.
2. 가족들의 스마트폰 브라우저(Chrome, Safari)로 해당 주소에 접속합니다.
3. **로그인**을 합니다 (Supabase 데이터가 연동되므로 기존 계정 사용 가능).
4. **홈 화면에 추가**합니다.
   - **iPhone (Safari)**: 공유 버튼(네모에 화살표) -> "홈 화면에 추가"
   - **Android (Chrome)**: 메뉴 버튼(점 3개) -> "앱 설치" 또는 "홈 화면에 추가"

이제 앱처럼 사용할 수 있습니다! 즐거운 퀘스트 되세요! ⚔️🛡️
