import util from '../../utils/util'
const app = getApp()

Page({
  data: {
    isLogin: false,
    role: null,
    steps: [
      {
        text: '完善信息'
      },
      {
        text: '选择产品'
      },
      {
        text: '提交保单'
      }
    ],
    step: '0',
    propertyCompany: {
      developCompany: '1',
      projectTime: '1',
      quality: '1'
    },
    individual: {
      houseTime: '1',
      style: '1',
      measure: '1'
    },
    dataList: {},
    name: '',
    cardNumber: '',
    mobile: ''
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
  onChange (event) {
    this.setData({
      [event.currentTarget.id]: event.detail
    })
  },
  submit () {
    let that = this
    let type = 1
    let propertyCompany = this.data.propertyCompany
    let individual = this.data.individual
    if (this.data.role == '23') {
      if (propertyCompany.developCompany == 1 && propertyCompany.projectTime == 1 && propertyCompany.quality == 1) {
        type = 1
      } else if (propertyCompany.developCompany == 3 && propertyCompany.projectTime == 3 && propertyCompany.quality == 3) {
        type = 3
      } else {
        type = 2
      }
    } else {
      if (individual.houseTime == 1 && individual.style == 1 && individual.measure == 1) {
        type = 1
      } else if (individual.houseTime == 3 && individual.style == 3 && individual.measure == 3) {
        type = 3
      } else {
        type = 2
      }
    }

    wx.showLoading({
      mask: true,
      title: '提交中'
    })
    util.request({
      path: '/app/businessproduct/getRecommendproduct',
      method: 'POST',
      data: {
        type: type
      }
    }, function (err, res) {
      if (res.code == 0) {
        let result = {}
        res.DATA.forEach((item) => {
          if(result.hasOwnProperty(item.companyId)) {
            result[item.companyId].product.push(item)
          } else {
            result[item.companyId] = {}
            result[item.companyId].companyName = item.companyName
            result[item.companyId].product = [item]
          }
        })
        console.log(result)
        that.setData({
          dataList: result,
          step: '1'
        })
        wx.hideLoading()
      } else {
        wx.showToast({
          mask: true,
          title: '失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  back0 () {
    this.setData({
      step: '0'
    })
  },
  back1 () {
    this.setData({
      step: '1'
    })
  },
  goToCommitOrder (event) {
    this.setData({
      companyValue: event.currentTarget.dataset.companyid,
      productValue: event.currentTarget.dataset.productid,
      step: '2'
    })
  },
  commitOrder (event) {
    console.log(this.data)
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
  onLoad: function () {
    var value = wx.getStorageSync('status')
    var currentRegisterInfo = app.globalData.currentRegisterInfo
    if(value == 2 || value == '') {
      wx.switchTab({
        url: '../register/register'
      })
      wx.hideTabBar()
    }else{
      this.setData({
        isLogin: true,
        role: currentRegisterInfo && currentRegisterInfo.role
      })
      if (currentRegisterInfo && currentRegisterInfo.role == 23) {
        this.setData({
          operatorId: currentRegisterInfo.userId
        })
      } else if (currentRegisterInfo && currentRegisterInfo.role == 24) {
        this.setData({
          name: currentRegisterInfo.name,
          cardNumber: currentRegisterInfo.cardNumber,
          mobile: currentRegisterInfo.mobile
        })
      }
      wx.showTabBar()
    }
  }
})
