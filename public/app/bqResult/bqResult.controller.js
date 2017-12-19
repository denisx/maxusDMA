'use strict'

angular.module('bqResult').controller('resulttable', ['$scope', 'bqResultFactory', ($scope, bqResultFactory) => {

		let killLoader = () => {
			document.getElementsByClassName('loaderDiv')[0].remove();
		};

		let getAnswer = (query) => {
			fillBread(query);
			bqResultFactory.getAnswerForQuery(query)
				.then((data) => {
					let postbuyTableContent = {
						data: data[0].data,
						columns: []
					};
					let googleAnalyticsTableContent = {
						data: data[2].data,
						columns: []
					};
					let yandexMetrikaTableContent = {
						data: data[1].data,
						columns: []
					};
					if (data[0].data !== false) {
						Object.keys(data[0].data[0]).forEach((key) => {
							postbuyTableContent.columns.push({
								field: key,
								title: key
							});
						});
					}
					if (data[2].data !== false) {
						Object.keys(data[2].data[0]).forEach((key) => {
							googleAnalyticsTableContent.columns.push({
								field: key,
								title: key
							});
						});
					}
					if (data[1].data !== false) {
						Object.keys(data[1].data[0]).forEach((key) => {
							yandexMetrikaTableContent.columns.push({
								field: key,
								title: key
							});
						});
					}
					initTable();
					$('#postbuyTable').bootstrapTable(postbuyTableContent);
					$('#googleAnalyticsTable').bootstrapTable(googleAnalyticsTableContent);
					$('#yandexMetrikaTable').bootstrapTable(yandexMetrikaTableContent);
					killLoader();
				});
			return false;
		}

		let initTable = () => {
			let settings = {
				"data-toggle": "table",
				"data-search": "true",
				"data-pagination": "true",
				"data-pagination-loop": "true",
				"data-page-number": "1",
				"data-page-list": "[10,25,50,100]",
				"data-page-size": 25,
				"data-toolbar": "#toolbar",
/* 				"data-show-export": "true",
				"data-export-data-type": "all", */
				"data-filter-control": "true",
				"data-filter-show-clear": "true",
				"data-sortable": true
			}
			Object.keys(settings).forEach((key) => {
				document.getElementById('postbuyTable').setAttribute(key, settings[key]);
				document.getElementById('googleAnalyticsTable').setAttribute(key, settings[key]);
				document.getElementById('yandexMetrikaTable').setAttribute(key, settings[key]);
			});
		}

		let fillBread = (query) => {
			let breadArr = ['industry', 'client', 'ad_goal'];
			let breadText = {};

			breadArr.forEach((elem)=>{
				if (query.filters[elem] != undefined) {
					breadText[elem] = query.filters[elem].join(', ');
				} else {
					breadText[elem] = 'Все';
				}
			})

			document.getElementsByClassName('breadHoverDefault')[0].classList.add('breadHoverInfo');
			document.getElementsByClassName('breadHoverInfo')[0].classList.remove('breadHoverDefault');

			document.addEventListener('mousemove', (e) => {
				if (e.target.closest('.breadText') != null) {
					let top = e.clientY + 20 + "px";
					let left = e.clientX - 50 + "px";
					let hovDiv = e.target.closest('.bread').getElementsByClassName('breadHoverInfo')[0];
					if (hovDiv == undefined) {
						return false;
					}
					hovDiv.firstElementChild.textContent = breadText[e.target.id];
					hovDiv.style.left = left;
					hovDiv.style.top = top;
				}
			});

		};

		let readLocalStorage = () => {
			return JSON.parse(window.localStorage.getItem('query'));
		}
		
		let eatId = () => {
			let a = 0;
			document.cookie.split(';').forEach((elem)=>{
				if(elem.split('=')[0] == 'id') {
					a =  elem.split('=')[1];
				}
			})
			return a;
		}
		
		getAnswer(readLocalStorage());

		$scope.download = () => {
			let hrefToDownload = 'lib/CSVData/' + eatId() + '_'+ $('li.active a').attr('id') + '_benchmarks_upload.csv';
			window.location.href = hrefToDownload;
		}

	}
]);