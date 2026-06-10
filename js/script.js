// console.log("コンソール");

// メインタブを切り替え
function changeTab(type, event) {
	const panels = document.querySelectorAll('.skills-tab__panel');
	panels.forEach(panel => {
		panel.classList.remove('skills-tab__panel--active');
	});

	const activePanel = document.getElementById(`${type}-content`);
	if (activePanel) {
		activePanel.classList.add('skills-tab__panel--active');
	}

	const buttons = document.querySelectorAll('.skills-tab__btn');
	buttons.forEach(btn => {
		btn.classList.remove('skills-tab__btn--active')
	});

	if (event) {
		event.currentTarget.classList.add('skills-tab__btn--active');
	} else {
		const initBtn = document.querySelector(`.skills-tab__btn[onclick*="${type}"]`);
		if (initBtn) initBtn.classList.add('skills-tab__btn--active');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('main-content');
	const navLinks = document.querySelectorAll('.sidebar__nav-link');

	// ページを読み込む
	function loadPage(pageName, title, callback) {
		fetch(pageName)
			.then(response => response.text())
			.then(html => {
				container.innerHTML = html;

				if (title) document.title = `${title} | My Portfolio`;

				if (pageName.includes('works.html')) {
					container.scrollTo(0, 0);
					const params = new URLSearchParams(window.location.search);
					const projectID = params.get('id');
					loadProjectDetail(projectID);
				}

				if (pageName.includes('about')) {
					setTimeout(() => changeTab('frontend'), 50);
				}

				if (callback) callback();
			});
	}

	// works詳細データの読み込み
	function loadProjectDetail(projectID) {
		fetch('projects.json')
			.then(res => res.json())
			.then(data => {
				const project = data.find(item => item.id === projectID);

				// console.log("読み込んだ作品データ:", project);

				if (project) {
					document.getElementById('work-title').textContent = project.title;
					document.getElementById('work-project-type').textContent = project.projectType;
					document.getElementById('work-category').textContent = project.category;
					document.getElementById('work-service').textContent = project.service;
					document.getElementById('work-overview').textContent = project.overview;
					document.getElementById('work-objective').textContent = project.objective;
					document.getElementById('work-target').textContent = project.target;
					document.getElementById('work-point').textContent = project.point;
					document.getElementById('work-duration').textContent = project.duration;
					document.getElementById('work-tools').textContent = project.tools.join(' / ');

					const techWrapper = document.getElementById('work-tech-wrapper');
					const techElement = document.getElementById('work-tech');

					if (project.stack && project.stack.length > 0) {
						techElement.textContent = project.stack.join(' / ');
						techWrapper.style.display = "flex";
					} else {
						techWrapper.style.display = "none";
					}

					// 画像
					const imgElement = document.getElementById('work-image');
					imgElement.src = project.image;
					imgElement.alt = project.title;

					// URL 動画リンク
					const urlWrapper = document.getElementById('work-url-wrapper');
					const urlElement = document.getElementById('work-url');
					const urlIcon = document.getElementById('work-url-icon');

					if (project.url && project.url !== "") {
						urlElement.href = project.url;
						urlElement.textContent = "View Site";
						urlIcon.className = "fa-solid fa-arrow-up-right-from-square work-detail__url-icon";
						urlWrapper.style.display = "flex";
					} else if (project.video_url && project.video_url !== "") {
						urlElement.href = project.video_url;
						urlElement.textContent = "Watch Video";
						urlIcon.className = "fa-solid fa-circle-play work-detail__url-icon";
						urlWrapper.style.display = "flex";
					} else {
						urlWrapper.style.display = "none";
					}

					// GitHubリンク
					const codeWrapper = document.getElementById('work-code-wrapper');
					const codeElement = document.getElementById('work-code');
					const codeIcon = document.getElementById('work-code-icon');

					if (project.github_url && project.github_url !== "") {
						codeElement.href = project.github_url;
						codeElement.textContent = "View Code";
						codeIcon.className = "fa-solid fa-arrow-up-right-from-square work-detail__code-icon";
						codeWrapper.style.display = "flex";
					} else {
						codeWrapper.style.display = "none";
					}

					console.log("データの読み込みに成功しました！");
				} else {
					console.error("IDが一致するプロジェクトがありません:", projectID);
				}
			})
			.catch(err => {
				console.error("JSONの読み込みに失敗しました。:", err);
			});
	}

	// ナビのクリックイベント
	navLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			const page = link.getAttribute('data-page');
			const href = link.getAttribute('href');
			const title = link.getAttribute('data-title');

			if (page) {
				e.preventDefault();
				loadPage(page, title);

				if (page.includes('home')) {
					setTimeout(() => {
						container.scrollTo({ top: 0, behavior: 'smooth' });
					}, 50);
				}
				return;
			}

			if (href && href.startsWith('#')) {
				e.preventDefault();
				const targetId = href.replace('#', '');
				const isDetailPage = window.location.search.includes('id=');
				const isHomeLoaded = document.getElementById('home-top') !== null;

				if (isDetailPage || !isHomeLoaded) {
					loadPage('home.html', 'Home', () => {
						history.pushState(null, '', window.location.pathname);
						setTimeout(() => {
							const target = document.getElementById(targetId);
							if (target) {
								container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
							}
						}, 100);
					});
				} else {
					const target = document.getElementById(targetId);
					if (target) {
						container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
					}
				}
			}
		});
	});

	// Worksのカードをクリックした時
	document.addEventListener('click', (e) => {
		const workLink = e.target.closest('.js-work-link');

		if (workLink) {
			e.preventDefault();

			sessionStorage.setItem('homeScrollPos', container.scrollTop);

			const projectID = workLink.getAttribute('data-id');
			history.pushState(null, '', `?id=${projectID}`);

			loadPage('works.html', 'Works Detail');
		}
	});

	// 「戻る」「進む」ボタンが押された時の処理
	window.addEventListener('popstate', (e) => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual'; // Safari対策
		}

		const params = new URLSearchParams(window.location.search);
		const projectID = params.get('id');

		if (projectID) {
			loadPage('works.html', 'Works Detail');
		} else {
			loadPage('home.html', 'Home', () => {
				const savedScrollPos = sessionStorage.getItem('homeScrollPos');
				if (savedScrollPos) {
					const targetPos = parseInt(savedScrollPos, 10);

					container.style.height = (targetPos + window.innerHeight) + 'px';

					setTimeout(() => {
						container.scrollTop = targetPos;
					}, 50);

					setTimeout(() => {
						container.scrollTop = targetPos;
						container.style.height = '';
					}, 150);
				}
			});
		}
	});

	// 初期読み込み時の判定
	const initialParams = new URLSearchParams(window.location.search);
	if (initialParams.has('id')) {
		loadPage('works.html', 'Works Detail');
	} else {
		loadPage('home.html', 'Home');
	}
});
