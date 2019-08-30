//获取应用实例
import util from "../../utils/util";

const app = getApp()

Page({
  data: {
    role: null,
    name: '',
    cardNumber: '',
    mobile: '',
    operatorId: '',
    companySourceData: [],
    companyValue: '',
    companyList: [],
    productSourceData: [],
    productValue: '',
    productList: ''
  },
  onLoad: function (routeParams ) {
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
      path: `/app/businessdata/info/${id}`,
      method: 'GET'
    }, function (err, res) {
      let data = res.businessData
      _this.setData({
        'name': data.name,
        'cardNumber': data.cardNumber,
        'mobile': data.mobile,
        "productId": data.productId,
        "companyId": data.companyId,
        "operatorId": data.operatorId,
      })
      _this.initCompanyProduct(data.companyId, data.productId)
    })
  },
  initCompanyProduct (companyId, productId) {
    let that = this
    util.request({
      path: '/app/businessdata/company',
      method: 'GET'
    }, function (err, res) {
      let companyValue = res.DATA.findIndex((item) => {return item.id === companyId})
      let companyList = res.DATA.map(item => { return item.companyName })
      that.setData({
        companySourceData: res.DATA,
        companyValue: companyValue,
        companyList: companyList
      })
    })
    util.request({
      path: `/app/businessdata/getProductByCompanyId/${companyId}`,
      method: 'GET'
    }, function (err, res) {
      let productValue = res.DATA.DATA.findIndex((item) => {return item.id === productId})
      let productList = res.DATA.DATA.map(item => { return item.productName })
      that.setData({
        productSourceData: res.DATA.DATA,
        productValue: productValue,
        productList: productList
      })
    })
  },
  companyChange (event) {
    let that = this
    util.request({
      path: `/app/businessdata/getProductByCompanyId/${this.data.companySourceData[event.detail.value].id}`,
      method: 'GET'
    }, function (err, res) {
      let productList = res.DATA.DATA.map(item => { return item.productName })
      that.setData({
        companyValue: event.detail.value,
        productSourceData: res.DATA.DATA,
        productValue: 0,
        productList: productList
      })
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
  delete () {
    let _this = this
    util.request({
      path: `/app/businessdata?id=${this.data.id}`,
      method: 'DELETE'
    }, function (err, res) {
      wx.showToast({
        mask: true,
        title: '删除成功',
        icon: 'success',
        duration: 1000,
        success () {
          setTimeout(() => {
            _this.goToList()
          }, 1000)
        }
      })
    })
  },
  save (e) {
    let _this = this
    if (!util.checkCardNum(this.data.cardNumber)) {
      wx.showToast({
        mask: true,
        icon: 'none',
        title: '请输入正确的身份证号',
        duration: 1000
      })
      return false
    }
    if (!util.checkPhone(this.data.mobile)) {
      wx.showToast({
        mask: true,
        icon: 'none',
        title: '请输入正确的手机号',
        duration: 1000
      })
      return false
    }
    wx.showLoading({
      mask: true,
      title: '提交中'
    })
    util.request({
      path: '/app/businessdata/update',
      method: 'POST',
      data: {
        id: this.data.id,
        name: this.data.name,
        cardNumber: this.data.cardNumber,
        mobile: this.data.mobile,
        productId: this.data.productSourceData[this.data.productValue].id,
        companyId: this.data.companySourceData[this.data.companyValue].id,
        operatorId: this.data.operatorId
      }
    }, function (err, res) {
      if (res.code == 0) {
        wx.showToast({
          mask: true,
          title: '修改成功',
          icon: 'success',
          duration: 1000,
          success () {
            setTimeout(() => {
              _this.goToList()
            }, 1000)
          }
        })
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
      return item.route == 'pages/my-list/my-list'
    }).length
    if (length) {
      wx.navigateBack({
        url: '../my-list/my-list'
      })
    } else {
      wx.redirectTo({
        url: '../my-list/my-list'
      })
    }
  }
})
