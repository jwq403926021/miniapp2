const app = getApp()
import util from '../../utils/util'

Page({
  data: {
    show: false,
    areaList: {},
    region: '',
    regionLabel: '',

    showAskUserInfoBtn: true,
    hasUserInfoAuth: false,
    hasBindPhone: false,
    userInfo: null,
    isDisableVerfiyBtn: true,
    verifyLabel: '获取验证码',
    registeInfo: {
      "avatarUrl": "",
      "cityCode": "",
      "companyName": "",
      "gender": "",
      "inviteCode": "",
      "mobile": "",
      "mobileCode": "",
      "name": "",
      "nickName": "",
      "provinceCode": "",
      "role": '23',
      "townCode": "",
      "cardNumber": ""
    },
    isOurUser: false,
    isModifyPhone: true
  },
  onChange(event) {
    this.setData({
      'registeInfo.role': event.detail
    });
  },
  onShow: function () {
    let value = wx.getStorageSync('status')
    let _isOurUser = (value == 2 || value == '') ? false : true
    console.log('show-->',_isOurUser, value)
    this.setData({
      hasBindPhone: _isOurUser,
      isOurUser: _isOurUser,
      isModifyPhone: _isOurUser
    })
  },
  onLoad: function (routeParams) {
    wx.hideLoading()
    let _this = this
    let value = wx.getStorageSync('status')
    let _isOurUser = (value == 2 || value == '') ? false : true
    console.log('load-->',_isOurUser, value)
    this.setData({
      hasBindPhone: _isOurUser,
      isOurUser: _isOurUser,
      isModifyPhone: _isOurUser
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo
              let currentData = app.globalData.currentRegisterInfo
              _this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfoAuth: true,
                'registeInfo.avatarUrl': app.globalData.userInfo.avatarUrl,
                'registeInfo.country': app.globalData.userInfo.country,
                'registeInfo.gender': app.globalData.userInfo.gender,
                'registeInfo.language': app.globalData.userInfo.language,
                'registeInfo.nickName': app.globalData.userInfo.nickName
              })
              if (currentData) {
                _this.setData({
                  region: currentData ? currentData.townCode : '',
                  "registeInfo.cityCode": currentData ? currentData.cityCode : '',
                  "registeInfo.companyName": currentData ? currentData.companyName : '',
                  "registeInfo.inviteCode": currentData ? currentData.inviteCode : '',
                  "registeInfo.mobile": currentData ? currentData.mobile : '',
                  "registeInfo.cardNumber": currentData ? currentData.cardNumber : '',
                  "registeInfo.name": currentData ? currentData.name : '',
                  "registeInfo.provinceCode": currentData ? currentData.provinceCode : '',
                  "registeInfo.role": currentData ? (currentData.role + '') : '',
                  "registeInfo.roleName": currentData ? (currentData.roleName + '') : '',
                  "registeInfo.townCode": currentData ? currentData.townCode : ''
                })
              }
            }
          })
        }
      }
    })
    this.initArea()
  },
  getRegionLabel () {
    let arr = []
    if (app.globalData.currentRegisterInfo) {
      arr.push(this.data.areaList['province_list'][app.globalData.currentRegisterInfo.provinceCode])
      arr.push(this.data.areaList['city_list'][app.globalData.currentRegisterInfo.cityCode])
      arr.push(this.data.areaList['county_list'][app.globalData.currentRegisterInfo.townCode])
    }
    this.setData({
      regionLabel: arr.length ? arr.join(',') : ''
    })
  },
  initArea () {
    let _this = this
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
  bindGetUserInfo(data) {
    if (data.detail.errMsg == "getUserInfo:fail auth deny") {
      return false
    }
    app.globalData.userInfo = data.detail.userInfo
    this.setData({
      showAskUserInfoBtn: false,
      userInfo: app.globalData.userInfo,
      hasUserInfoAuth: true,
      'registeInfo.avatarUrl': app.globalData.userInfo.avatarUrl,
      'registeInfo.country': app.globalData.userInfo.country,
      'registeInfo.gender': app.globalData.userInfo.gender,
      'registeInfo.language': app.globalData.userInfo.language,
      'registeInfo.nickName': app.globalData.userInfo.nickName
    })

    let currentData = app.globalData.currentRegisterInfo
    if (currentData) {
      this.setData({
        region: currentData ? currentData.townCode : '',
        "registeInfo.cityCode": currentData ? currentData.cityCode : '',
        "registeInfo.companyName": currentData ? currentData.companyName : '',
        "registeInfo.inviteCode": currentData ? currentData.inviteCode : '',
        "registeInfo.mobile": currentData ? currentData.mobile : '',
        "registeInfo.cardNumber": currentData ? currentData.cardNumber : '',
        "registeInfo.name": currentData ? currentData.name : '',
        "registeInfo.provinceCode": currentData ? currentData.provinceCode : '',
        "registeInfo.role": currentData ? (currentData.role + '') : '',
        "registeInfo.roleName": currentData ? (currentData.roleName + '') : '',
        "registeInfo.townCode": currentData ? currentData.townCode : ''
      })
    }
    console.log('hasUserInfoAuth && hasBindPhone', this.data.hasUserInfoAuth,this.data.hasBindPhone)
  },
  submitRegiste() {
    let _this = this
    if (!util.checkPhone(this.data.registeInfo.mobile)) {
      return false
    }
    if (!util.checkCardNum(this.data.registeInfo.cardNumber) && this.data.registeInfo.role == '24') {
      return false
    }
    if (this.data.isOurUser && this.data.registeInfo.mobile != app.globalData.currentRegisterInfo.mobile && this.data.registeInfo.mobileCode == '') {
      wx.showToast({
        mask: true,
        title: '手机验证码不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (this.data.registeInfo.name == '' || this.data.registeInfo.name == null){
      wx.showToast({
        mask: true,
        title: '姓名不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (!this.data.registeInfo.townCode) {
      wx.showToast({
        mask: true,
        title: '地址不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    let params = Object.assign({}, this.data.registeInfo)
    wx.showLoading({
      mask: true,
      title: '提交中'
    })
    util.request({
      path: '/app/register',
      method: 'POST',
      data: params
    }, function (err, res) {
      if (res.code == 0) {
        app.globalData.currentRegisterInfo = res.userInfo
        _this.setData({
          isOurUser: true,
          isModifyPhone: false,
          "registeInfo.mobileCode": '',
          "registeInfo.inviteCode": res.userInfo.inviteCode,
          "registeInfo.roleName": res.userInfo.roleName,
          "registeInfo.companyName": res.userInfo.companyName || ''
        })
          wx.setStorageSync('status', 1)
          wx.showToast({
            mask: true,
            title: '操作成功',
            icon: 'success',
            duration: 2000,
            success: function () {
                setTimeout(()=> {
                    wx.switchTab({
                        url: '../index/index',
                        success: function (e) {
                            var page = getCurrentPages().pop();
                            if (page == undefined || page == null) return;
                            page.onLoad();
                        }
                    })
                }, 2000)
            }
        })
      }
    })
  },
  openLocation() {
    if (!this.data.isOurUser) {
      this.setData({
        show: !this.show
      })
    }
  },
  onConfirm(data) {
    let strArr = []
    data.detail.values.forEach(item => {
      strArr.push(item.name)
    })
    this.setData({
      show: false,
      regionLabel: strArr.join(','),
      'registeInfo.townCode': data.detail.values[2].code,
      'registeInfo.cityCode': data.detail.values[1].code,
      'registeInfo.provinceCode': data.detail.values[0].code,
      'registeInfo.town': data.detail.values[2].name,
      'registeInfo.city': data.detail.values[1].name,
      'registeInfo.province': data.detail.values[0].name
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  requestVerifyCode () {
    let _this = this
    if (!util.checkPhone(this.data.registeInfo.mobile) || this.data.isDisableVerfiyBtn) {
      return false
    }

    util.request({
      path: '/app/register/code',
      method: 'GET',
      data: {
        mobile: this.data.registeInfo.mobile
      }
    }, function (err, res) {
      if (res.code == 0) {
        let count = 120
        _this.setData({
          isDisableVerfiyBtn: true,
          verifyLabel: `${count}s后再试`
        })
        _this.countTimer = setInterval(() => {
          count--
          if (count <= 0){
            _this.setData({
              isDisableVerfiyBtn: false,
              verifyLabel: `获取验证码`
            })
            _this.countTimer && clearInterval(_this.countTimer)
          } else {
            _this.setData({
              isDisableVerfiyBtn: true,
              verifyLabel: `${count}s后再试`
            })
          }
        }, 1000)
      }
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

    if (name == 'registeInfo.mobile') {
      this.setData({
        isDisableVerfiyBtn: false
      })
    }
  },
  bindPhoneNum () {
    let _this = this
    if (!util.checkPhone(this.data.registeInfo.mobile)) {
      return false
    }
    if (this.data.registeInfo.mobileCode == '' || this.data.registeInfo.mobileCode == null){
      wx.showToast({
        mask: true,
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.showLoading({
      mask: true,
      title: '提交中'
    })
    util.request({
      path: '/app/binding',
      method: 'POST',
      data: {
        mobile: this.data.registeInfo.mobile,
        code: this.data.registeInfo.mobileCode
      }
    }, function (err, res) {
      if (res.code == 0) {
        wx.hideLoading()
        _this.setData({
          isModifyPhone: false,
          'hasBindPhone': true,
          "registeInfo.companyName": res.userInfo.companyName || '',
          "registeInfo.inviteCode": res.userInfo.inviteCode,
          "registeInfo.name": res.userInfo.name,
          "registeInfo.role": res.userInfo.role || '23', // '新用户默认 1查勘员'
          "registeInfo.roleName": res.userInfo.roleName,
          'registeInfo.townCode': res.userInfo.townCode,
          'registeInfo.cityCode': res.userInfo.cityCode,
          'registeInfo.provinceCode': res.userInfo.provinceCode
        })
      }
    })
  },
  copyInviteCode (e) {
    let code = e.currentTarget.dataset.code;
    wx.setClipboardData({
      data: code,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
      }
    })
  }
})
