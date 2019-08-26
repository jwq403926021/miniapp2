const app = getApp()

Page({
  data: {
    isLogin: false,
    role: null
  },
  onShow () {
    var value = wx.getStorageSync('status')
    if(value == 2 || value == '') {
      console.log('隐藏 index', '|', value, '|')
      wx.switchTab({
        url: '../register/register'
      })
      wx.hideTabBar()
    }
    this.onLoad()
  },
  onLoad: function () {
    var value = wx.getStorageSync('status')
    if(value == 2 || value == '') {
      console.log('隐藏 index', '|', value, '|')
      wx.switchTab({
        url: '../register/register'
      })
      wx.hideTabBar()
    }else{
      console.log('显示 index', '|', value, '|')
      this.setData({
        isLogin: true,
        role: app.globalData.currentRegisterInfo && app.globalData.currentRegisterInfo.role
      })
      wx.showTabBar()
    }
  }
})
