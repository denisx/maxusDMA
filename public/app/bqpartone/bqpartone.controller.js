'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
		$scope.menuElements = {
			dataSource : {
				ga: {
					id : 'ga',
					name: 'Google Analytics',
					content : {
						dimension : ['date', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category'],
						metrics : ['visits', 'pageviews', 'bounces', 'session_duration']
					},
					chosen : {
						dimension : [],
						metrics : [],
						name : 'google_analytics',
						goals : false
					}
				},
				ym: {
					id : 'ym',
					name: 'Yandex Metrika',
					content : {
						dimension : ['date', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'isBounce', 'time_on_site', 'device_category', 'gender', 'age'],
						metrics : ['visits', 'users', 'pageviews']	
					},
					chosen : {
						dimension : [],
						metrics : [],
						name: 'yandex_metrika',
						goals : false
					}
				}
			},
			postbuy: {
				id: 'postbuy',
				name: 'Postbuy',
				content : ["brand", "campaign", "placement", "medium", "ad_goal", "year", "month", "date_start", "date_end", "duration", "tns_audience", "geo", "socdem", "interests", "device", "frequency", "format", "budget", "impressions", "views", "video_view_25", "video_view_50", "video_view_75", "video_view_100", "clicks", "sessions", "unique_users", "conversion_1", "conversion_2", "cpm", "ctr", "vtr","cpview_video", "cpvisit", "cr_1", "cr_2", "cpa_1", "cpa_2", "reach", "reach_p", "fact_budget", "fact_impressions", "fact_views", "fact_video_view_25", "fact_video_view_50", "fact_video_view_75", "fact_video_view_100", "fact_clicks", "fact_visits", "fact_users", "fact_conversion_1", "fact_conversion_2", "fact_cpm", "fact_ctr", "fact_vtr", "fact_cpview_video", "fact_cpvisit", "fact_cr_1", "fact_cr_2", "fact_cpa_1", "fact_cpa_2", "fact_reach", "fact_reach_p", "successful", "comments"],
				chosen : []
			}, 
			campaign : {
				id : 'campaign',
				name: 'Кампании',
				content: [],
				chosen : []
			},
			placement : {
				id : 'placement',
				name: 'Размещение',
				content: [],
				chosen : []
			},
			medium : {
				id : 'medium',
				name: 'Medium',
				content: [],
				chosen : []
			},
			format : {
				id : 'format',
				name: 'Формат',
				content: [],
				chosen : []
			},
			site : {
				id: 'site',
				name: 'Сайты',
				content: [],
				chosen : []
			},
			client : {
				chosen : []
			},
			industry : {
				chosen : []
			},
			ad_goal : {
				chosen : []
			}
		};
		
		let drp = $('input[name="daterange"]');	
		drp.daterangepicker(
			{
				locale: {
				  format: 'YYYY-MM-DD'
				},
				startDate: moment().subtract(60, 'days').format('YYYY-MM-DD'),
				endDate: moment().format('YYYY-MM-DD'),
				timepicker: false
			}
		);
		
		let convertDateFormat = (date) =>  {
			return date.split('-').join('');
		}
		
		let answer = {filters:{}, 
					  startDate : convertDateFormat(drp.data('daterangepicker').startDate._i), 
					  endDate : convertDateFormat(drp.data('daterangepicker').endDate._i) };
		
					  
		let selectGoalsCheckbox = () => {
			$('.bottomMVW').click(function () {
				if ($(this).children('#goalCheck')[0].checked == false) {
					$(this).children('#goalCheck')[0].checked = true
					$(this).css({"background-color": "#5bb7e1", "color": "white"});
				} else {
					$(this).children('#goalCheck')[0].checked = false
					$(this).css({"background-color": "transparent", "color": "#5bb7e1"});
				}
			})
		}
//		selectGoalsCheckbox();

		$scope.listenToHover = (currentBox) => {
			let currentMenuPoint = (currentBox.classList.contains('hoverToNewMenu')) ? currentBox : currentBox.closest('.hoverToNewMenu');
			$scope.menuToShow = currentMenuPoint.id;
			let menuPopupClassName = choosePopup();
			document.getElementsByClassName(menuPopupClassName)[0].classList.toggle('hideElement');
			if(workingWithData().metricsOrNot() == true){
//				document.querySelector('input[id="goalCheck"]').onchange = workingWithData().changeGoals;
				workingWithData().checkGoals();
			}
			document.addEventListener('click', function closeModal (e) {

				if((e.target.closest('.'+menuPopupClassName)==null)&&(e.target.closest('.hoverToNewMenu')!=currentMenuPoint)) {
					document.getElementsByClassName(menuPopupClassName)[0].classList.toggle('hideElement');
					document.removeEventListener('click', closeModal);
				}
				
				if(e.target.closest('.xContainer')!=null) {
					workingWithData('chosen', e.target.closest('.xContainer')).toggleValues();
					$scope.$apply();
				}
				
				if(e.target.closest('.elementToChooseMVW')!=null) {
					workingWithData('content', e.target.closest('.elementToChooseMVW')).toggleValues();
					$scope.$apply();
				}
				
				if(e.target.closest('.addAllButton')!=null) {
					workingWithData('content', e.target).moveArrays();
					$scope.$apply();
				}
				
				if(e.target.closest('.removeAllButton')!=null) {
					workingWithData('chosen', e.target).moveArrays();
					$scope.$apply();
				}
				
				if(e.target.closest('#goalCheck')!=null){
					workingWithData().changeGoals();
				}
				
				if(e.target.closest('.bottomMVW')!=null && e.target.closest('#goalCheck')==null){
					workingWithData().changeGoals();
					workingWithData().checkGoals();
					
				}
				
//				document.querySelector('input[id="goalCheck"]').onchange = workingWithData().changeGoals();
				
				

			});
		}
		
		$scope.sendReport = () => {
			Object.keys($scope.menuElements).forEach((key)=>{
				costyl(key);
			});
			console.log(answer);
			setTimeout(()=>{bqpartoneFactory.sendQueryNextPage(answer)}, 1);
//			window.location.href = '/result';
		};
		
		// on page loads send req to get data from server, after table&bread are loaded, kills loader
		// void
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
					fillMenuElements(data);
					fillBread();
					console.log(data);
					let tableContent = {
						data: data,
						columns : []
					};
					Object.keys(data[0]).forEach((key)=>{
						tableContent.columns.push({field:key,title:key});
					})
					$('#table').bootstrapTable(tableContent);
					killLoader();
                });
        };
		
		
		// Transforms data from table to push it to menu
		// void
		let fillMenuElements = (tableData) => {
			let reqNames = ['Campaign', 'Placement', 'Medium', 'Format', 'Site'];
			tableData.forEach((row)=>{
				reqNames.forEach((columnName)=>{
					row[columnName].split(',').forEach((elem)=>{
						if ($scope.menuElements[columnName.toLowerCase()].content.indexOf(elem) == -1) {
							$scope.menuElements[columnName.toLowerCase()].content.push(elem);
						}
					});
				});
				row.Date_start = row.Date_start.value;
				row.Date_end = row.Date_end.value;
			});
		};
		
		
		// Eats cookie info abouut choosen bread vals
		// void
		let fillBread = () => {
			let breadArr = ['industry','client','ad_goal'];
			let breadText = {};
			document.cookie.split('; ').forEach((elem)=>{
				let content = elem.split('=');
				if (breadArr.includes(content[0])){
					$scope.menuElements[content[0]].chosen = elem.split('=')[1].split(', ');
				}
			});
			breadArr.forEach((elem)=>{
				if ($scope.menuElements[elem].chosen.length > 0) {
					breadText[elem] = $scope.menuElements[elem].chosen.join(', ');
				} else {
					breadText[elem] = 'Все';
				}
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
					hovDiv.firstElementChild.textContent = breadText[e.target.id];
					hovDiv.style.left = left;
					hovDiv.style.top = top;
				}
			});
			
		};
		
		// Class for 
		let workingWithData = (state, target) => {
			let obj = {};
			
			obj.metricsOrNot = () => {
				return (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow));
			}
			
			obj.getValue = () => {
				return (state == 'content') ? target.firstElementChild.textContent : target.previousElementSibling.firstElementChild.textContent;
			}
			
			obj.getClassName = () => {
				return (state == 'content') ? '.elementToChooseMVW' : '.elementChosenMVW';
			};
			
			obj.getArraysAdress = () => {
				let answ = {};
				let chosen = [], content = [];
				if (obj.metricsOrNot() == true){
					let className = obj.getClassName();
					let paramName = $scope.menuElements.dataSource[$scope.menuToShow];
					let metricsDimensions = target.closest('.group').getAttribute('data-type');
					chosen = paramName.chosen[metricsDimensions];
					content = paramName.content[metricsDimensions];
				} else {
					let paramName = $scope.menuElements[$scope.menuToShow];
					chosen = paramName.chosen;
					content = paramName.content;
				}
				answ.toRemove = (state == 'content') ? content : chosen;
				answ.toAdd = (state == 'content') ? chosen : content;
				return answ;
			}			
			
			obj.toggleValues = () => {
				let container = obj.getArraysAdress();
				let value = obj.getValue();
				container.toAdd.push(value);
				container.toRemove.splice(container.toRemove.indexOf(value),1);
			}
			
			obj.moveArrays = () => {
				let container = obj.getArraysAdress();
				let length = container.toRemove.length;
				for (let i = 0; i<container.toRemove.length; 0) {
					container.toAdd.push(container.toRemove[i]);
					container.toRemove.splice(i,1);
				}
			}
			
			obj.checkGoals = () => {
				let goal = $scope.menuElements.dataSource[$scope.menuToShow].chosen.goals;
				document.getElementById('goalCheck').checked = goal;
				obj.redrawButton(goal);
			}
			
			obj.changeGoals = () => {
				let goal = $scope.menuElements.dataSource[$scope.menuToShow].chosen.goals;
				$scope.menuElements.dataSource[$scope.menuToShow].chosen.goals = (goal)?false:true;
				obj.redrawButton(goal);
			}
			
			obj.redrawButton = (param) => {
				if(document.getElementById('goalCheck').parentNode.classList.contains('bottomMVWSelected') && !param){
					document.getElementById('goalCheck').parentNode.classList.remove('bottomMVWSelected');
				} else {
					document.getElementById('goalCheck').parentNode.classList.add('bottomMVWSelected');
				}
			}
			return obj;
		}
		
		// indicates opening menu with metrics, or normal variant
		// returns className
		let choosePopup = () => { 
			return workingWithData().metricsOrNot()? 'hoverMenuWithMetrics' : 'hoverMenuWithVariants';
		}

		// removes html element with loader after and removes 'hide' from table
		// void
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].remove();
			document.getElementsByClassName('tablePadding')[0].firstElementChild.classList.remove('hideElement');
        };
		
		//Костыль для перевода заглавных в строчные, пока Mongoose не перезаписан
		let costyl = (key) => {
			if (key == 'dataSource') {
				Object.keys($scope.menuElements[key]).forEach((innerKey) => {
					answer[innerKey] = $scope.menuElements[key][innerKey].chosen;
				});
			} else {
				if ($scope.menuElements[key].chosen.length > 0) {
					answer.filters[key] = $scope.menuElements[key].chosen;
				}
			}
			if (key == 'postbuy') {
				answer[key] = answer.filters[key];
				delete answer.filters[key];
			}
			if ((key == 'client'||key == 'industry')&&answer.filters[key]!=undefined) {
				answer.filters[key].forEach((elem,i,arr)=>{
					arr[i] = elem.charAt(0).toLowerCase() + elem.slice(1);
				});
			}
		};
		
		let initTable = () => {
			let settings = {
				"data-toggle":"table",
				"data-search":"true",
				"data-pagination":"true",
				"data-pagination-loop":"true",
				"data-page-number":"1",
				"data-page-list":"[10,25,50,100]",
				"data-toolbar":"#toolbar",
				"data-show-export":"true",
				"data-export-data-type": "all",
				"data-filter-control":"true",
				"data-filter-show-clear":"true"
			}
			Object.keys(settings).forEach((key)=>{
				document.getElementById('table').setAttribute(key, settings[key]);
			})
		}
		
		// indicates changing of dates in daterangepicker and pushes it to answer
		drp.on('apply.daterangepicker', (ev, picker)=>{
			answer.startDate = convertDateFormat(picker.startDate._d.toISOString().split('T')[0]);
			answer.endDate = convertDateFormat(picker.endDate._d.toISOString().split('T')[0]);
		})
		
		initTable();
		getResults();
		
		

    }]);