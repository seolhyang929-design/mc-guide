# 마크 생존 가이드

마인크래프트 초보를 위한 비공식 생존 가이드 사이트입니다. HTML / CSS / JS만으로 만들어져 서버 없이 GitHub Pages에서 바로 동작합니다.

## 파일 구성

- `index.html` – 페이지 구조
- `style.css` – 스타일
- `data.js` – 체크리스트, 광물, 몹, 인챈트, 팁 데이터 (내용 수정은 여기서)
- `script.js` – 탭, 검색, 체크리스트 저장 등 동작

## 로컬에서 열기

VS Code에서 폴더를 열고 `index.html`을 더블클릭하거나, Live Server 확장을 설치해 "Go Live"를 누르면 됩니다.

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소(repository)를 만듭니다. 예: `mc-guide`
2. VS Code 터미널에서 이 폴더로 이동한 뒤:

```bash
git init
git add .
git commit -m "첫 커밋"
git branch -M main
git remote add origin https://github.com/<내아이디>/mc-guide.git
git push -u origin main
```

3. GitHub 저장소 페이지 → **Settings** → 왼쪽 메뉴 **Pages**
4. **Build and deployment** → Source: `Deploy from a branch`
5. Branch: `main`, 폴더: `/ (root)` 선택 후 **Save**
6. 1~2분 뒤 `https://<내아이디>.github.io/mc-guide/` 에서 접속됩니다.

이후 파일을 수정하면 `git add . && git commit -m "수정" && git push` 로 반영됩니다.

## 내용 바꾸기

`data.js`의 배열에 항목을 추가하거나 수정하면 화면에 자동 반영됩니다. 예를 들어 몹을 하나 더 넣으려면 `MOBS` 배열에 같은 형식으로 한 줄 추가하면 됩니다.
