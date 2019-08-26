//获取应用实例
import util from "../../utils/util";
const app = getApp()

Page({
  data: {
    show: false,
    dataList: [],
    insuredName: '',
    cardNumber: '',
    phone: ''
  },
  onPullDownRefresh () {
    this.getInitData()
  },
  onShow () {
    this.getInitData()
  },
  onLoad: function () {
    let _this = this
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          height: res.windowHeight
        })
      }
    })
  },
  goToHandleTask (event) {
    wx.navigateTo({
      url: '../pipe-form/pipe-form?id=' + event.currentTarget.dataset.id + '&orderId=' + event.currentTarget.dataset.orderid
    })
  },
  onCancel () {
    this.setData({
      show: false
    })
  },
  onConfirm () {
    this.setData({
      show: false
    })
  },
  searchInsuredNameChange (data) {
    this.setData({
      insuredName: data.detail
    })
  },
  searchCardNumberChange (data) {
    this.setData({
      cardNumber: data.detail
    })
  },
  searchPhoneChange (data) {
    this.setData({
      phone: data.detail
    })
  },
  getInitData () {
    let _this = this
    let filter = {
      name: this.data.insuredName,
      cardNumber: this.data.cardNumber,
      mobile: this.data.phone,
      page: 0,
      size: 1000
    }
    if (this.data.searchKeyword) {
      filter.customName = this.data.searchKeyword
    }
    if (this.data.searchStatus != -1) {
      filter.status = this.data.searchStatus
    }
    console.log(filter, this.data.searchKeyword, this.data.searchStatus)
    wx.showLoading({
      mask: true,
      title: '加载中'
    })
    util.request({
      path: '/app/businessdata/list',
      method: 'GET',
      data: filter
    }, function (err, res) {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      _this.setData({
        dataList: res.data
      })
    })
  }
})
