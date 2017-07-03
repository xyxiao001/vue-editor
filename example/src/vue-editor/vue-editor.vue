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
              <a href="#" @click="iconClick($event, 'p')"><p>正文</p></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'pre')"><pre>code</pre></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'blockquote')"><blockquote>引用</blockquote></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h1')"><h1>标题一</h1></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h2')"><h2>标题二</h2></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h3')"><h3>标题三 </h3></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h4')"><h4>标题四 </h4></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h5')"><h5>标题五 </h5></a>
            </li>
            <li>
              <a href="#" @click="iconClick($event, 'h6')"><h6>标题六</h6></a>
            </li>
          </ul>
        </div>
      </Icon>
    </div>
    <div
      class="editor-body"
      contenteditable="true"
      spellcheck="false"
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
      selectedRange: '',
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
          name: '斜体',
          type: 'italic',
          icon: 'icon-italic',
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
        },
        {
          name: '无序列表',
          type: 'unorderedlist',
          icon: 'icon-unorderedlist',
          drop: false,
          canChoose: true,
          choose: false
        },
        {
          name: '有序列表',
          type: 'orderedlist',
          icon: 'icon-orderedlist',
          drop: false,
          canChoose: true,
          choose: false
        }
      ]
    }
  },
  methods: {
    iconClick (event, type) {
      event.preventDefault()
      this.$refs.editor.focus()
      this.selectedRange = this.getSelect()
      this.restoreSelection()
      // 修改所选区域的样式
      this.changeStyle(type)
      this.$nextTick(() => {
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre'].forEach((val, index) =>{
          type = val === type ? 'style' : type
        })
        var arr = this.iconList.map((val, index) => {
          if (type === val.type && val.canChoose) {
            val.choose = val.choose ? false : true
          }
          return val
        })

        if (type === 'clear') {
          var arr = this.iconList.map((val, index) => {
            val.choose = false
            return val
          })
        }
        this.iconList = arr
      })
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
        case 'italic':
          document.execCommand('italic', false)
          break
        case 'clear':
          document.execCommand('removeFormat', false)
          break
        case 'unorderedlist':
          document.execCommand('insertUnorderedList', false)
          break
        case 'orderedlist':
          document.execCommand('insertorderedList', false)
          break
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'p':
        case 'pre':
        case 'blockquote':
          document.execCommand('formatBlock', false, type)
          break
        default:
          console.log('none')
      }
    },

    // 恢复光标位置
    restoreSelection() {
      var selection = window.getSelection()
      if (this.selectedRange) {
        try {
          selection.removeAllRanges() /*清空所有Range对象*/
        } catch (ex) {
          /*IE*/
          document.body.createTextRange().select()
          document.selection.empty()
        }
        /*恢复保存的范围*/
        selection.addRange(this.selectedRange)
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

  h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6, p, a{
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
    color: inherit;
    margin: 0;
    text-decoration: none;
  }

  code, kbd, pre, samp {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
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
    text-align: left;
    list-style: none;
  }

  .dropmenu ul li a {
    display: block;
    padding: 5px 10px;
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
<style>
  .vue-editor blockquote {
    padding: 10px 20px;;
    font-size: 17.5px;
    border-left: 5px solid #f86466;
    background: white;
  }

  .vue-editor pre {
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

  .editor-body blockquote {
    margin-bottom: 30px;
  }

  .editor-body pre {
    margin-bottom: 10px;
  }

  .editor-body ul {
    padding-left: 40px;
    list-style-type: disc;
  }

  .editor-body ol {
    padding-left: 40px;
  }
</style>
