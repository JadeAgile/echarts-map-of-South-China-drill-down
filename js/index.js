//华南地区地图（第一级地图）的ID、Name、Json数据
var areaId = 100000;
var areaName = '华南地区'
var areaJson = null;

//记录父级ID、Name
var mapStack = [];
var parentId = null;
var parentName = null;

$(function () {//dom加载后执行
    mapChart('mapChart')
})



/**
 * 根据Json里的数据构造Echarts地图所需要的数据
 * @param {} mapJson 
 */
function initMapData(mapJson) {
    var mapData = [];
    for (var i = 0; i < mapJson.features.length; i++) {
    	var ifMin = mapJson.features[i].properties.hasOwnProperty('childrenNum')&&mapJson.features[i].properties.childrenNum==0;
        mapData.push({
            name: mapJson.features[i].properties.name,
            value: ifMin? -2 : Math.random() * 1000,
			parent: mapJson.features[i].properties.parent.adcode,
        })
    }
    return mapData;
}

/**
 * 返回上一级地图
 */
function back() {
    if (mapStack.length != 0) {//如果有上级目录则执行
        var map = mapStack.pop();
        $.get('./asset/json/map/' + map.mapId + '.json', function (mapJson) {
            registerAndsetOption(myChart, map.mapId, map.mapName, mapJson, false)
            //返回上一级后，父级的ID、Name随之改变
            parentId = map.mapId;
            parentName = map.mapName;

        })

    }

}
/**
 * Echarts地图
 */


//Echarts地图全局变量，主要是在返回上级地图的方法中会用到
var myChart = null;
function mapChart(divid) {

    $.get('./asset/json/map/' + areaId + '.json', function (mapJson) {
        areaJson = mapJson;
        myChart = echarts.init(document.getElementById(divid));
        registerAndsetOption(myChart, areaId, areaName, mapJson, false)
        parentId = areaId;
        parentName = '华南地区'
        myChart.on('click', function (param) {

            var cityId = cityMap[param.name]
            if (cityId&&cityId!=parentId) {
                $.get('./asset/json/map/' + cityId + '.json', function (mapJson) {
                    registerAndsetOption(myChart, cityId, param.name, mapJson, true)
                })
            } else {
                //没有下级地图，回到一级中国地图，并将mapStack清空
                // registerAndsetOption(myChart, areaId, areaName, areaJson, false)
                // mapStack = []
                // parentId = areaId;
                // parentName = areaName;
            }

        });


    })
}

/**
 * 
 * @param {*} myChart 
 * @param {*} id        省市县Id
 * @param {*} name      省市县名称
 * @param {*} mapJson   地图Json数据
 * @param {*} flag      是否往mapStack里添加parentId，parentName
 */
function registerAndsetOption(myChart, id, name, mapJson, flag) {
	var scatterArray = [];//散点数据
    echarts.registerMap(name, mapJson);
	if(mapJson.features[0].properties.hasOwnProperty('childrenNum')&&mapJson.features[0].properties.childrenNum!=0){//0813--这一行if条件修改
		myChart.setOption({
			tooltip:{
				trigger: 'item',
				position: 'right',
				formatter: function(params) {
					if(params.seriesIndex == 0){
						var province = ''
						switch (JSON.stringify(params.data.parent)){
							case '440000':
								province = '广东省'
								break;
							case '530000':
								province = '云南省'
								break;
							case '520000':
								province = '贵州省'
								break;
							case '450000':
								province = '广西壮族自治区'
								break;
							case '460000':
								province = '海南省'
								break;
							default:
								break;
						}
						return province + '-' + params.name + ':<br/>' + '停电事件:1<br/>' + '低电压告警:3<br/>' + '负荷告警:1<br/>' + '风险预警:0<br/>'
					}else{
						return params.name + '台区/配电房:<br/>' + '停电事件:1<br/>' + '低电压告警:3<br/>' + '负荷告警:1<br/>' + '风险预警:0<br/>';
					}
				}
			},
			visualMap:{
				icon: "itemSymbol",
				align: "left",
				seriesIndex: 0,
				type: 'piecewise',
				pieces: [
					{
						value: -1,
						label: '正常',
						color: '#83d587',
					},
					{
						min: 0,
						max: 500,
						label: '警告',
						color: "#1e87f0"
					},
					{
						min: 500,
						max: 1000,
						label: '次要',
						color: "#fdad4d"
					},
					{
						min: 1000,
						max: 1500,
						label: '主要',
						color: "#fd7b4d"
					},
					{
						min: 1500,
						label: '紧急',
						color: "#f56c6c"
					}
				],
				textStyle:{
					color:'rgba(255,255,255,0.7)',
					fontSize:16
				},
			},
			geo: {
			   show: false,
			   map: name,
			 },
			roam: true,
		    series: [
				{
			        type: 'map',
			        map: name,
			        zoom:  1.23,
			        aspectScale: 0.75, //长宽比
					label:{
						show: false,
						color: '#fff',
						fontSize: 12,
						position: 'inside',
						textBorderColor:'#fff',
						textBorderWidth:1.4,
					},
			        itemStyle: {
			            normal:{
							areaColor: 'rgba(0,0,0,0)',
							borderColor: 'rgba(255,255,255,0.6)',
							borderWidth:1.2,
						},
			        },
					emphasis:{
						label:{
							show: false,
							fontSize: 14,
						},
						itemStyle:{
							areaColor: 'rgba(30,135,240,0.4)',
							shadowColor: 'rgba(0, 0, 0, 0.5)',
							shadowBlur: 20
						}
					},
			        data: initMapData(mapJson)
			    },
		        {
		            name: '点',
		            type: 'scatter',
		            coordinateSystem: 'geo',
		            symbol: 'pin', //气泡
		            symbolSize: 26,
		            label: {
		                normal: {
		                    show: false,
		                    textStyle: {
		                        color: '#fff',
		                        fontSize: 9,
		                    }
		                }
		            },
		            itemStyle: {
		                normal: {
		                    color: function(params){
								var data = params.data.data;
								if(data<=40){
									return '#83d587';
								}else if(data<=55){
									return '#1e87f0';
								}else if (data<=70){
									return '#fdad4d';
								}else if (data<=85){
									return '#fd7b4d';
								}else{
									return '#f56c6c';
								}
							}

						}	
		            },
		            zlevel: 6,
		            data: scatterArray,
		        },
			]
		},true);
	}else{
		mapJson.features.forEach(function(cv,index,arr){
			var temp = {};
			if(typeof cv.properties.center == 'object'){
				temp = {name: cv.properties.name,value:[cv.properties.center[0], cv.properties.center[1],Math.floor(Math.random() * 100)]};
			}else{
				centerTemp = cv.properties.center.split(',');
				temp = {name: cv.properties.name,value:[centerTemp[0], centerTemp[1],Math.floor(Math.random() * 100)]};
			}
			scatterArray.push(temp)
		})
		myChart.setOption({
			tooltip:{
				trigger: 'item',
				position: 'right',
				formatter: function(params) {
					if(params.seriesIndex == 0){
						return  params.name + ':<br/>' + '停电事件:1<br/>' + '低电压告警:3<br/>' + '负荷告警:1<br/>' + '风险预警:0<br/>';	
					}else{
						return params.name + '台区/配电房:<br/>' + '停电事件:1<br/>' + '低电压告警:3<br/>' + '负荷告警:1<br/>' + '风险预警:0<br/>';
					}
				}
			},
			visualMap:{
				align: "left",
				seriesIndex: 1,
				type: 'piecewise',
				pieces: [
					{
						lte: 40,
						label: '<=40',
						color: '#83d587',
					},
					{
						gt:40,
						lte: 55,
						label: '(40,55]',
						color: "#1e87f0",
					},
					{
						gt:55,
						lte: 70,
						label: '(55,70]',
						color: "#fdad4d",
					},
					{
						gt:70,
						lte: 85,
						label: '(70,85]',
						color: "#fd7b4d",
					},
					{
						gt:85,
						label: '>85',
						color: "#f56c6c",
					}
				],
				textStyle:{
					color:'rgba(255,255,255,0.7)',
					fontSize:16
				},
			},
			geo: {
			   show: false,
			   map: name,
			 },
			roam: false,
		    series: [
				{
			        type: 'map',
			        map: name,
			        zoom:  1.23,
			        aspectScale: 0.75, //长宽比
					label:{
						show: true,
						color: '#fff',
						fontSize: 12,
						position: 'inside',
					},
			        itemStyle: {
			            normal:{
								areaColor: 'rgba(30,135,240,0.4)', /*区县面积颜色*/
			                    label:{
			                        show:true,//隐藏地图上文字
			                        fontSize:12,
			                        color:'#595959',
			                        textBorderColor:'#fff',
			                        textBorderWidth:1.4
			                    },
			                    borderColor: 'rgba(255,255,255,0.6)',
			                    borderWidth:2,
			                },
			        },
					emphasis:{
						label:{
							show: false,
							fontSize: 14,
						},
						itemStyle:{
							areaColor:'rgba(30,135,240,0.2)',
							shadowColor: 'rgba(0, 0, 0, 0.5)',
							shadowBlur: 10
						}
					},
			        data: initMapData(mapJson)
			    },
		        {
		            name: '点',
		            type: 'scatter',
		            coordinateSystem: 'geo',
		            symbol: 'pin', //气泡
		            symbolSize: 26,
		            label: {
		                normal: {
		                    show: false,
		                    textStyle: {
		                        color: '#fff',
		                        fontSize: 9,
		                    }
		                }
		            },
		            itemStyle: {
		                normal: {
		                    color: function(params){
								var data = params.data.data;
								if(data<=40){
									return '#83d587';
								}else if(data<=55){
									return '#1e87f0';
								}else if (data<=70){
									return '#fdad4d';
								}else if (data<=85){
									return '#fd7b4d';
								}else{
									return '#f56c6c';
								}
							}
		                }
		            },
		            zlevel: 1,
		            data: scatterArray,
		        },
			]
		},true);
	}
	
    

    if (flag) {//往mapStack里添加parentId，parentName,返回上一级使用
        mapStack.push({
            mapId: parentId,
            mapName: parentName
        });
        parentId = id;
        parentName = name;
    }
    if(name == '华南地区'){
		$('.backBtn').hide();
	}else{
		$('.backBtn').show();
	}
}