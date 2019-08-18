const app = getApp()
var Promise = require('./es6-promise.min')
var constants = require('./constants')
// util.request({ authorization: true, path: '/bindphone', method: 'POST', data: param }, cb)
function request(param, cb) {
  // console.log('request:'+JSON.stringify(param));
  var req = function (param) {
    return new Promise(function (resolve, reject) {
      param.data = param.data || {};
      // if (param.authorization) {
      var token = wx.getStorageSync('token');
      // }
      wx.request({
        url: constants.domain + param.path,
        data: param.data === null ? '' : param.data,
        method: param.method,
        header: {
          'token': token
        },
        success: function (res) {
          // console.log('request result:'+JSON.stringify(res))
          if (res.statusCode == 200) {
            if (res.data.code == 500 || res.data.CODE == 500){
              wx.showToast({
                mask: true,
                title: res.data.msg || '请求错误，请联系管理员',
                icon: 'none',
                duration: 2000
              })
              reject(res.data)
            }
            resolve(res.data)
          } else {
            // console.log('requst 请求失败:'+JSON.stringify(res))
            reject(res)
          }
        },
        fail: function (res) {
          // console.log('requst err'+JSON.stringify(res))
          reject(res)
        }
      })
    })
  }
  req(param)
    .done(function (data) {
      cb(null, data)
    }, function (err) {
      cb(err)
    });
}

// util.uploadFile({ businessType: 'userAvatar', path: '/ins/upload', filePath: param.filePath }, cb)
//上传文件
function uploadFile(param, cb) {
  wx.uploadFile({
    url: constants.domain + param.path,
    filePath: param.filePath,
    name: 'names',
    header: {
      'authorization': 'Bearer ' + wx.getStorageSync('token'),
      'Content-Type': 'multipart/form-data'
    },
    formData: {
      'type': 'instructor'
    },
    success: function (res) {
      if (res.statusCode == 200) {
        cb(null, JSON.parse(res.data));
      } else {
        // console.log('uploadFile 请求失败:'+JSON.stringify(res))
        cb(res);
      }
    },
    fail: function (res) {
      // console.log('uploadFile err'+JSON.stringify(res))
      cb(res);
    }
  })
}

//检测是否登陆
function isLogin(url) {
  let token = wx.getStorageSync('token')
  if (token == '') {
    wx.redirectTo({
      url: url,
    })
  }
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  request: request,
  isLogin: isLogin,
  uploadFile: uploadFile
}