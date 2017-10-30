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
						goals : 'no'
					}
				},
				ym: {
					id : 'ym',
					name: 'Yandex Metrika',
					content : {
						dimension : ['isBounce', 'time_on_site', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category', 'gender', 'age'],
						metrics : ['visits', 'users', 'pageviews']	
					},
					chosen : {
						dimension : [],
						metrics : [],
						goals : 'no'
					}
				}
			},
			postbuy: {
				id: 'postbuy',
				name: 'Postbuy',
				content : ["brand", "campaign", "placement", "medium", "ad_goal", "year", "month", "date_start", "date_end", "duration", "tns_audience", "geo", "socdem", "interests", "device", "frequency", "format", "budget", "impressions", "views", "video_view_25", "video_view_50", "video_view_75", "video_view_100", "clicks", "visits", "users", "conversion_1", "conversion_2", "cpm", "ctr", "vtrcpview_video", "cpvisit", "cr_1", "cr_2", "cpa_1", "cpa_2", "reach", "reach_p", "fact_budget", "fact_impressions", "fact_views", "fact_video_view_25", "fact_video_view_50", "fact_video_view_75", "fact_video_view_100", "fact_clicks", "fact_visits", "fact_users", "fact_conversion_1", "fact_conversion_2", "fact_cpm", "fact_ctr", "fact_vtr", "fact_cpview_video", "fact_cpvisit", "fact_cr_1", "fact_cr_2", "fact_cpa_1", "fact_cpa_2", "fact_reach", "fact_reach_p", "successful", "comments"],
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
				startDate: '2015-01-01',
				endDate: '2016-12-01',
				timepicker: false
			}
		);
		
		let convertDateFormat = (date) =>  {
			return date.split('-').join('');
		}
		
		let answer = {filters:{}, 
					  startDate : convertDateFormat(drp.data('daterangepicker').startDate._i), 
					  endDate : convertDateFormat(drp.data('daterangepicker').endDate._i) };
			
		$scope.listenToHover = (currentBox) => {
			let currentMenuPoint = (currentBox.classList.contains('hoverToNewMenu')) ? currentBox : currentBox.closest('.hoverToNewMenu');
			$scope.menuToShow = currentMenuPoint.id;
			let menuPopupClassName = choosePopup();
			let menuPopup = document.getElementsByClassName(menuPopupClassName)[0];
			
			menuPopup.setAttribute('type', $scope.menuToShow);
			menuPopup.classList.toggle('hideElement');
			
			document.addEventListener('click', function closeModal (e) {

				if((e.target.closest('.'+menuPopupClassName)==null)&&(e.target.closest('.hoverToNewMenu')!=currentMenuPoint)) {
					document.getElementsByClassName(menuPopupClassName)[0].classList.toggle('hideElement');
					document.removeEventListener('click', closeModal);
				}
				
				if(e.target.closest('.xContainer')!=null) {
					chooseRemoveValue(e.target.closest('.xContainer'), 'chosen');
					$scope.$apply();
				}
				
				if(e.target.closest('.elementToChooseMVW')!=null) {
					chooseRemoveValue(e.target.closest('.elementToChooseMVW'), 'content');
					$scope.$apply();
				}
				
				if(e.target.closest('#addAllButton')!=null) {
					chooseRemoveValue(e.target.closest('.elementToChooseMVW'), 'content');
					$scope.$apply();
				}
				
				

			});
		}
		
		$scope.sendReport = () => {
			Object.keys($scope.menuElements).forEach((key)=>{
				if (key == 'dataSource') {
					Object.keys($scope.menuElements[key]).forEach((innerKey)=>{
						answer[innerKey] = $scope.menuElements[key][innerKey].chosen;
					});
				} else {
					if ($scope.menuElements[key].chosen.length>0) {
						answer.filters[key] = $scope.menuElements[key].chosen;
					}
				}
			});
			console.log(answer);
		};
		

		// on page loads send req to get data from server, after fills table, bread, and kills loader
		// return false
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
					fillMenuElements(data);
					fillBread();
					console.log(data);
					let tableContent = {
						data: data
					};
					$('#table').bootstrapTable(tableContent);
					killLoader();
                });
			return false;
        };
		
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
		
		
		
		let fillBread = () => {
			let breadArr = ['industry','client','ad_goal']
			document.cookie.split('; ').forEach((elem)=>{
				let content = elem.split('=');
				if (breadArr.includes(content[0])){
					$scope.menuElements[content[0]].chosen = elem.split('=')[1].split(', ');
				};
			});
		};
		
		// Adds choosed value to chosen array and removes from chosen on deleting
		let chooseRemoveValue = (target, state) => {
			let value = (state == 'content') ? target.firstElementChild.textContent : target.previousElementSibling.firstElementChild.textContent;
			let className = (state == 'content') ? '.elementToChooseMVW' : '.elementChosenMVW';
			let dataObj = whatToMove(target, className);
			let toRemove = (state == 'content') ? dataObj.content : dataObj.chosen;
			let toAdd = (state == 'content') ? dataObj.chosen : dataObj.content;
			toAdd.push(value);
			toRemove.splice(toRemove.indexOf(value),1);
		};
		
		// indicates targets of deleting and adding arrays in menuElements Object on clicks in menu
		// returns Obj with content and chosen params
		let whatToMove = (target, className) => {
			let answ = {};
			if (metricsOrNot()){
				let paramName = $scope.menuElements.dataSource[$scope.menuToShow];
				answ.chosen = paramName.chosen[target.closest(className).parentNode.className];
				answ.content = paramName.content[target.closest(className).parentNode.className];
			} else {
				let paramName = $scope.menuElements[$scope.menuToShow];
				answ.chosen = paramName.chosen;
				answ.content = paramName.content;
			}
			return answ;
		}
		
		// indicates opening menu with metrics, or normal variant
		// returns className
		let choosePopup = () => { 
			return metricsOrNot()? 'hoverMenuWithMetrics' : 'hoverMenuWithVariants';
		}
		
		// indicates current state of opened menu
		// returns bool
		let metricsOrNot = () => {
			return (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow));
		}

		// removes html element with loader after and removes 'hide' from table
		// returns none
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].remove();
			document.getElementsByClassName('tablePadding')[0].firstElementChild.classList.remove('hideElement');
			return false;
        };
		


		
		drp.on('apply.daterangepicker', (ev, picker)=>{
			answer.startDate = convertDateFormat(picker.startDate._i);
			answer.endDate = convertDateFormat(picker.endDate._i);
			
		})
		
		getResults();
		
		

    }]);