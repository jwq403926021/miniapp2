import util from "../../utils/util";
const app = getApp()
Page({
  data: {
    url: ''
  },
  onLoad: function (routeParams ) {
    console.log(routeParams.url, "##")
    this.setData({
      url: routeParams.url
    })
  },
})
