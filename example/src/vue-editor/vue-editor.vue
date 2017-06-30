<template>
  <div class="vue-editor">
    <div class="editor-control">
      <Icon
        v-for="(item, $index) in iconList"
        :name="item.name"
        :type="item.type"
        :icon="item.icon"
        :choose="item.choose"
        @iconClick="iconClick"
      >
        <div class="dropmenu drop-style" v-if="$index === 0">
          <ul>
            <li>
              <p>正文</p>
            </li>
            <li>
              <pre>code</pre>
            </li>
            <li>
              <blockquote>引用</blockquote>
            </li>
            <li>
              <h1>标题一</h1>
            </li>
            <li>
              <h2>标题二</h2>
            </li>
            <li>
              <h3>标题三 </h3>
            </li>
            <li>
              <h4>标题四 </h4>
            </li>
            <li>
              <h5>标题五 </h5>
            </li>
            <li>
              <h6>标题六</h6>
            </li>
          </ul>
        </div>
      </Icon>
    </div>
    <div
      class="editor-body"
      contenteditable="true"
      ref="editor"
      v-html="html">
    </div>
  </div>
</template>

<script>
import Icon from './icon'
export default {
  data: function () {
    return {
      html: '<p><br></p>',
      iconList: [
        {
          // hover名字
          name: '标签',
          // 点击事件处理
          type: 'style',
          // 图标样式
          icon: 'icon-magic',
          // 是否有下拉菜单
          drop: true,
          // 是否被选中
          canChoose: true,
          choose: false
        },
        {
          name: '粗体',
          type: 'bold',
          icon: 'icon-bold',
          drop: false,
          canChoose: true,
          choose: false
        },
        {
          name: '下划线',
          type: 'underline',
          icon: 'icon-underline',
          drop: false,
          canChoose: true,
          choose: false
        },
        {
          name: '清除样式',
          type: 'clear',
          icon: 'icon-xiangpi',
          drop: false,
          canChoose: false,
          choose: false
        },
        {
          name: '字体颜色',
          type: 'fontFamily',
          icon: 'icon-char',
          drop: false,
          canChoose: true,
          choose: false
        }
      ]
    }
  },
  methods: {
    iconClick (event, type) {
      var arr = this.iconList.map((val, index) => {
        if (type === val.type && val.canChoose) {
          val.choose = val.choose ? false : true
        }
        return val
      })
      this.iconList = arr
      this.changeStyle(type)
      console.log(this.getSelect())
    },

    // 获取选中
  getSelect() {
    if (window.getSelection) {
        /*主流的浏览器，包括chrome、Mozilla、Safari*/
        var sel = window.getSelection()
        if (sel.rangeCount > 0) {
          return sel.getRangeAt(0)
        }
      } else if (document.selection) {
        /*IE下的处理*/
        return document.selection.createRange()
      }
      return null
    },
    // 改变选取的内容
    changeStyle(type) {
      switch (type) {
        case 'bold':
          document.execCommand('bold', false)
          break
        case 'underline':
          document.execCommand('underline', false)
          break
        default:
          console.log('none')
      }
    }
  },
  components: {
		Icon
	}
}
</script>

<style lang="css" scoped>
  @import "//at.alicdn.com/t/font_8e1zfc5tlz6ywrk9.css";

  h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6, p{
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
    color: inherit;
    margin: 0;
  }

  pre {
    display: block;
    padding: 9.5px;
    font-size: 13px;
    line-height: 1.42857143;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  code, kbd, pre, samp {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  }

  blockquote {
    padding: 10px 20px;;
    font-size: 17.5px;
    border-left: 5px solid #f86466;
    background: white;
  }

  .vue-editor {
    position: relative;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #a9a9a9;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .editor-control {
    display: flex;
    flex-flow: row wrap;
    height: 40px;
    color: #333;
    border-bottom: 1px solid transparent;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background-color: #f5f5f5;
    border-color: #ddd;
  }

  .dropmenu {
    display: none;
    position: absolute;
    top: 32px;
    left: 0;
    z-index: 1000;
    min-width: 160px;
    padding: 5px 0;
    margin: 2px 0 0;
    font-size: 14px;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ccc;
    border: 1px solid rgba(0, 0, 0, .15);
    border-radius: 4px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
  }

  .dropmenu ul li {
    padding: 2px 10px;
    margin-bottom: 8px;
    text-align: left;
    list-style: none;
  }

  .editor-body {
    height: 300px;
    padding: 10px;
    color: #000;
    background-color: #fff;
    overflow: auto;
    outline: none;
  }

  .editor-body p {
    font-size: 14px;
    color: #68747f;
		margin: 0 0 10px;
  }
</style>
