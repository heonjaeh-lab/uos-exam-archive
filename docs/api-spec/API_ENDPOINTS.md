# 서울시립대 OpenAPI 엔드포인트 정리

> API Key: `202605464QQC8823` (.env 파일로 분리 권장)
> Base URL: `https://wise.uos.ac.kr/COM/`

---

## 1. 수업계획서 조회

- **URL**: `https://wise.uos.ac.kr/COM/ApiCoursePlan/list.do`
- **요청 변수** (모두 필수)
  - `apiKey`, `year`, `term`, `subjectNo`, `dvclNo`
- **응답 필드**
  - `year`, `term`, `subject_no`, `subject_nm`, `dvcl_no`
  - `week` (주차), `shyr` (학년), `sub_dept` (학부)
  - `tel`, `class_prac_nm`, `eval_method_nm`, `lsn_div_nm`
  - `thema_cn` (수업내용), `tchmtr_cn` (교재), `asmt_cn` (과제)
  - `lesn_mth_cn` (수업방법), `class_type`, `lession_goal`, `core_comp`
  - `prof_kor_nm` (담당교수), `mail`

## 2. 건물&강의실 조회

- **URL**: `https://wise.uos.ac.kr/COM/ApiBldg/list.do`
- **요청 변수**: `apiKey` 만 필요
- **응답 필드**
  - `building` (건물코드), `building_nm` (건물명)
  - `room_cd` (강의실코드), `room_nm` (강의실명), `spce_nm` (공간명)

## 3. 학과 조회

- **URL**: `https://wise.uos.ac.kr/COM/ApiDept/list.do`
- **요청 변수**
  - `apiKey` (필수)
  - `deptNm` (부서명, 선택)
  - `openYn` (현재 운영 학과만 보고싶으면 'Y')
- **응답 필드 (3개 리스트)**
  - `deptDivList` (소속구분): DEPT_CD, DEPT_NM, UP_DEPT_CD, UP_DEPT_NM, DEPT_DIV
  - `deptList` (대학): ORD, DEPT_CD, DEPT_CD_NM, DEPT_NM, UP_DEPT_CD, UP_DEPT_NM, DEPT_DIV
  - `subDeptList` (학부/과): + COLG_CD, COLG_NM

## 4. 과목 조회

- **URL**: `https://wise.uos.ac.kr/COM/ApiSubject/list.do`
- **요청 변수**
  - `apiKey`, `year`, `term`, `subjectNm` (교과목명) — 필수
  - `subjectNo` (교과목번호, 선택)
  - `dvclNo` (분반번호, 선택)
  - `subjectDiv` (교과구분, 01~11)
    - 01: 교양선택, 02: 교양필수, 03: 전공필수, 04: 전공선택
    - 05: 일반선택, 06: ROTC, 07: 교직, 08: 교환학점
    - 09: 선수, 10: 기초선택, 11: 공통선택
  - `deptCd` (대학코드, 예: API22120416)
  - `profNm` (담당교수명)
  - `univGdhlDeptCd` (1: 대학, 2: 대학원)
- **응답 필드**
  - SUBJECT_NO, SUBJECT_NM, DVCL_NO, SUBJECT_DIV
  - DEPT (개설학부), PNT (학점), PROF_NM (대표교수명)

## 5. 시간표 조회 ⭐ 핵심

- **URL**: `https://wise.uos.ac.kr/COM/ApiTimeTable/list.do`
- **요청 변수** (모두 필수)
  - `apiKey`, `year`, `term`
- **응답 필드**
  - `year`, `term`, `subject_no`, `subject_nm`, `dvcl_no`, `shyr`
  - `subject_div2`, `subject_div`, `sub_dept`, `day_night_nm` (주야)
  - `credit` (학점), `class_nm` (강의시간및강의실 ⭐)
  - `prof_kor_nm`, `class_type`
  - `etc_permit_yn` (타학과 허가), `sec_permit_yn` (복수전공 허가)

---

## 학기 코드
- 1학기 = `10`
- 2학기 = `20`
- (계절학기는 11/21 추정 — 추후 확인)

## 아직 안 받은 API
- 학사일정 조회 (필요)
- 빈 강의실 조회
- 강의평가 결과
- 종합 수업 시간표 조회 (시간표 조회와 다른 건지 확인 필요)

## OpenAPI 외 (크롤링 필요)
- 학식 메뉴
- 학과 공지사항
