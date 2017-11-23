'use strict'

angular.module('bqResult').controller('resulttable', ['$scope', 'bqResultFactory',
	($scope, bqResultFactory) => {

		let killLoader = () => {
			document.getElementsByClassName('loaderDiv')[0].remove();
		};

		let getAnswer = () => {
			fillBread();
			bqResultFactory.getAnswerForQuery()
				.then((data) => {
					console.log(data);
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
				"data-sortable": true,
				"height": 100
			}
			Object.keys(settings).forEach((key) => {
				document.getElementById('postbuyTable').setAttribute(key, settings[key]);
				document.getElementById('googleAnalyticsTable').setAttribute(key, settings[key]);
				document.getElementById('yandexMetrikaTable').setAttribute(key, settings[key]);
			});
		}

		let fillBread = () => {
			let breadArr = ['industry', 'client', 'ad_goal'];
			let breadText = {};
			document.cookie.split('; ').forEach((elem) => {
				let content = elem.split('=');
				if (breadArr.includes(content[0])) {
					breadText[content[0]] = elem.split('=')[1];
				}
			});

			breadArr.forEach((elem) => {
				if (breadText[elem] == undefined) {
					breadText[elem] = 'Все';
				}
			});

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

		getAnswer();

		$scope.download = () => {
			let hrefToDownload = 'lib/CSVData/' + $('li.active a').attr('id') + '_benchmarks_upload.csv';
			window.location.href = hrefToDownload;
		}

		/* let ctx = document.getElementById('myChart').getContext('2d'); 
		let chart = new Chart(ctx, {
			// The type of chart we want to create
			type: 'line',

			// The data for our dataset
			data: {
				labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
				datasets: [{
						label: "Test data",
						backgroundColor: 'transparent',
						borderColor: 'rgb(0, 182, 224)',
						data: [0, 10, 5, 2, 20, 30, 45, 34, 55, 27, 42, 46, 47, 33, 49]
					},
					{
						label: "Test data 2 ",
						backgroundColor: 'transparent',
						borderColor: '#e12e31', //'#55b14e',
						data: [3, 12, 4, 4, 8, 20, 59, 34, 50, 22, 40, 51, 24, 39, 55]
					}
				]
			},

			// Configuration options go here
			options: {
				responsive: true,
				responsiveAnimationDuration: 500,
				maintainAspectRatio: false,
				animation: {
					easing: 'easeOutCirc'
				}
			}
		}); */
	}
]);