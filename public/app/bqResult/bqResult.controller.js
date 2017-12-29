'use strict'

angular.module('bqResult').controller('resulttable', ['$scope', 'bqResultFactory', ($scope, bqResultFactory) => {

		let killLoader = () => {
			document.getElementsByClassName('loaderDiv')[0].remove();
		};

		let getAnswer = (query) => {
			fillBread(readBread());
			bqResultFactory.getAnswerForQuery(query)
				.then((data) => {
					let tableContent = {
						"postbuy":{
							data: data.postbuy,
							columns: []
						},
						"yandexMetrika":{
							data: data.yandex_metrika,
							columns: []
						},
						"googleAnalytics": {
							data: data.google_analytics,
							columns: []
						}
					};
					Object.keys(tableContent).forEach((table)=>{
						if (tableContent[table].data!=false){
							Object.keys(tableContent[table].data[0]).forEach((key)=>{
								tableContent[table].columns.push({
									field: key,
									title: key
								})
							})
						}
					});
					deleteCookie('changeSettings', '/filters');
					initTable();
					$('#postbuyTable').bootstrapTable(tableContent.postbuy);
					$('#googleAnalyticsTable').bootstrapTable(tableContent.googleAnalytics);
					$('#yandexMetrikaTable').bootstrapTable(tableContent.yandexMetrika);
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
			let breadArr = Object.keys(query);
			let breadText = {};
			
			breadArr.forEach((elem)=>{
				breadText[elem] = query[elem].join(', ');
			})
			document.getElementsByClassName('breadHoverDefault')[0].classList.add('breadHoverInfo');
			document.getElementsByClassName('breadHoverInfo')[0].classList.remove('breadHoverDefault');
			
			document.addEventListener('mousemove', (e)=>{
				if (e.target.closest('.breadText')!=null) {
					let top = e.clientY + 20 + "px";
					let left = e.clientX  - 50 + "px";
					let hovDiv = e.target.closest('.bread').getElementsByClassName('breadHoverInfo')[0];
					if (hovDiv == undefined) {
						return false;
					}
					hovDiv.firstElementChild.textContent = breadText[e.target.id.split('bread_')[1]];
					hovDiv.style.left = left;
					hovDiv.style.top = top;
				}
			});

		};

		let readLocalStorage = () => {
			let a = JSON.parse(window.localStorage.getItem('query'));
			setId(a);
			return a;
		}
		
		let readBread = () => {
			return JSON.parse(window.localStorage.getItem('filters'));
		}
		
		let setId = (a) => {
			if (eatId() == undefined) {
				a.id = undefined;
			} else {
				a.id = eatId();
			}
		}
		
		let eatId = () => {
			let a = undefined;
			document.cookie.split(';').forEach((elem)=>{
				if(elem.split('=')[0] == 'id') {
					a =  elem.split('=')[1];
				}
			})
			return a;
		}
		
		let changeSettingsCookie = () => {
			document.cookie = "changeSettings=true; expires=Fri, 31 Dec 2050 23:59:59 GMT; path=/filters";
		}
		
		getAnswer(readLocalStorage());

		$scope.download = () => {
			window.open('/filedownload?id=' + eatId() + '&type=' + $('li.active a').attr('id'));
		}
		
		$scope.changeSettings = () => {
			changeSettingsCookie();
			window.location = '/filters'
		}
		
		let deleteCookie = (name, path) => {
			let pathstring = '';
			if (path!=''){
				pathstring = 'path = ' + path;
			}
			document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;' + pathstring;
		}
		
		window.onbeforeunload = () => {
			bqResultFactory.unlinkFiles(eatId());
			console.log('+');
		}
//		document.addEventListener('beforeunload',(e)=>{
//			console.log(e);
//		}, false)
	}
]);