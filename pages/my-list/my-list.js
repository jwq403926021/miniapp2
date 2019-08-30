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
      url: '../order-detail/order-detail?id=' + event.currentTarget.dataset.id
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
  getDataClearFilter () {
    this.setData({
      insuredName: '',
      cardNumber: '',
      phone: ''
    })
    this.getInitData()
  },
  getInitData () {
    let _this = this
    let filter = {
      page: 1,
      size: 1000
    }
    if (this.data.insuredName) {
      filter.name = this.data.insuredName
    }
    if (this.data.cardNumber) {
      filter.cardNumber = this.data.cardNumber
    }
    if (this.data.phone) {
      filter.mobile = this.data.phone
    }
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
        dataList: res.page.records || []
      })
    })
  }
})
