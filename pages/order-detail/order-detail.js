//获取应用实例
import util from "../../utils/util";

const app = getApp()

Page({
  data: {
    show: false,
    taskData: {
      "provinceCode": "",
      "areaCode": "",
      "cityCode": "",
      "customMobile": '',
      "customName": "",
      "information": "",
      "offer": "",
      "live": "",
      "insurerUserMobile": "",
      "dredgeUserMobile": ""
    },
  },
  onLoad: function (routeParams ) {
    this.initArea()
    if (routeParams && routeParams.id) {
      this.setData({
        id: routeParams.id,
        role: app.globalData.currentRegisterInfo.role
      })
      this.initDataById(routeParams.id)
    }
  },
  initDataById (id) {
    let _this = this
    util.request({
      path: '/app/dredge/info',
      method: 'GET',
      data: {
        id: id
      }
    }, function (err, res) {
      let data = res.data
      _this.setData({
        'informationImageFiles': informationImageFiles,
        'liveImageFiles': liveImageFiles,
        'status': data.status,
        'taskData.areaCode': data.areaCode,
        'taskData.cityCode': data.cityCode,
        'taskData.provinceCode': data.provinceCode,
        "taskData.customMobile": data.customMobile,
        "taskData.customName": data.customName,
        "taskData.information": data.information,
        "taskData.offer": data.offer,
        "taskData.live": data.live,
        "taskData.insurerUserMobile": data.insurerUserMobile,
        "taskData.dredgeUserMobile": data.dredgeUserMobile
      })
      _this.getRegionLabel()
    })
  },
  initArea () {
    let _this = this
    _this.setData({
      region: app.globalData.currentRegisterInfo.townCode,
      'taskData.area': app.globalData.currentRegisterInfo.townCode,
      'taskData.areaCode': app.globalData.currentRegisterInfo.townCode,
      'taskData.cityCode': app.globalData.currentRegisterInfo.cityCode,
      'taskData.provinceCode': app.globalData.currentRegisterInfo.provinceCode
    })
    util.request({
      path: '/sys/area/list',
      method: 'GET'
    }, function (err, res) {
      _this.setData({
        areaList: res.DATA.DATA
      })
      _this.getRegionLabel()
    })
  },
  getRegionLabel () {
    let arr = []
    if (this.data.region && this.data.areaList.hasOwnProperty('province_list')) {
      let provinceCode = this.data.region.slice(0,2) + '0000'
      let cityCode = this.data.region.slice(0,4) + '00'
      let townCode = this.data.region
      arr.push(this.data.areaList['province_list'][provinceCode])
      arr.push(this.data.areaList['city_list'][cityCode])
      arr.push(this.data.areaList['county_list'][townCode])
    }
    this.setData({
      regionLabel: arr.length ? arr.join(',') : ''
    })
  },
  openLocation() {
    this.setData({
      show: !this.show
    })
  },
  onConfirm(data) {
    let strArr = []
    data.detail.values.forEach(item => {
      strArr.push(item.name)
    })

    this.setData({
      show: false,
      region: data.detail.values[2].code,
      regionLabel: strArr.join(','),
      'taskData.areaCode': data.detail.values[2].code,
      'taskData.cityCode': data.detail.values[1].code,
      'taskData.provinceCode': data.detail.values[0].code,
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  inputgetName(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    if (name.indexOf('.')) {
      let nameList = name.split('.')
      if (this.data[nameList[0]]) {
        nameMap[nameList[0]] = this.data[nameList[0]]
      } else {
        nameMap[nameList[0]] = {}
      }
      nameMap[nameList[0]][nameList[1]] = e.detail.value
    } else {
      nameMap[name] = e.detail.value
    }
    this.setData(nameMap)
  },
  dialPhone (e) {
    let phone = e.currentTarget.dataset.phone+'';
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  commitSubmit (e) {
    let data = this.data.taskData
    let _this = this
    let isSave = e.currentTarget.dataset.save
    let taskData = {
      "customMobile": data.customMobile,
      "customName": data.customName,
      "information": data.information,
      "areaCode": data.areaCode,
      "cityCode": data.cityCode,
      "provinceCode": data.provinceCode
    }
    if (this.data.id) {
      taskData.id = this.data.id
      taskData.orderId = this.data.orderId
    }
    if (this.data.status == '12'){ // 暂存 二次点击
      taskData.status = '12'
    }
    let informationImageFiles = []
    _this.data.informationImageFiles.map(item => {
      if (item.path.indexOf('https://') == -1){
        informationImageFiles.push({path: item.path, type: 1})
      }
    })

    if (taskData.customName == '') {
      wx.showToast({
        mask: true,
        title: '请填写客户姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (taskData.customMobile == '' && _this.data.informationImageFiles.length == 0) {
      wx.showToast({
        mask: true,
        title: '客户手机和报案图片必须填写一项',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (taskData.customMobile) {
      let isVaidcustomerPhone = this.checkPhone(taskData.customMobile, '请输入正确的客户手机号')
      if (!isVaidcustomerPhone) {
        return
      }
    }

    wx.showLoading({
      mask: true,
      title: '提交中'
    })
    util.request({
      path: isSave ? '/app/dredge/save' : '/app/dredge/commit',
      method: 'POST',
      data: taskData
    }, function (err, res) {
      console.log('工单新建：', res)
      if (res.code == 0) {
        let imgPaths = [...informationImageFiles]
        console.log('Upload Files:', imgPaths)
        _this.setData({
          'orderId': res.orderId
        })
        let count = 0
        let successUp = 0
        let failUp = 0
        if (imgPaths.length) {
          _this.uploadOneByOne(imgPaths,successUp,failUp,count,imgPaths.length)
        } else {
          wx.showToast({
            mask: true,
            title: '创建成功',
            icon: 'success',
            duration: 1000,
            success () {
              setTimeout(() => {
                _this.goToList()
              }, 1000)
            }
          })
        }
      } else {
        wx.showToast({
          mask: true,
          title: '创建失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  goToList () {
    let pages = getCurrentPages()
    let length = pages.filter((item) => {
      return item.route == 'pages/my-list-pipe/my-list-pipe'
    }).length
    if (length) {
      wx.navigateBack({
        url: '../my-list-pipe/my-list-pipe'
      })
    } else {
      wx.redirectTo({
        url: '../my-list-pipe/my-list-pipe'
      })
    }
  }
})
