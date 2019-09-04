import util from "../../utils/util";
const app = getApp()
Page({
  data: {
    url: ''
  },
  onLoad: function (routeParams ) {
    this.setData({
      url: routeParams.url
    })
  },
})
