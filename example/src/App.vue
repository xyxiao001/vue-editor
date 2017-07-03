<template>
	<div class="wrapper">
		<h1><a class="title" href="https://github.com/xyxiao001/vue-editor" target="_blank">vue-editor</a></h1>
		<iframe src="https://ghbtns.com/github-btn.html?user=xyxiao001&repo=vue-editor&type=star&count=true&size=large" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>
		<div class="show-editor">
			<vue-editor></vue-editor>
		</div>
	</div>
</template>

<script>
import vueEditor from './vue-editor'
export default {
  data: function () {
    return {
    }
  },
  components: {
		vueEditor
	}
}
</script>

<style lang="css">
	.wrapper {
		margin: auto;
		max-width: 1200px;
	}

	* {
	  margin:0;
		padding: 0;
	}

	.show-editor {
		margin: 100px auto;
		max-width: 1000px;
	}

	p {
		font-size: 14px;
    color: #68747f;
		margin: 0 0 10px;
	}

	.title {
		display: block;
    text-decoration: none;
    text-align: center;
    line-height: 1.5;
    margin: 20px 0px;
    background-image: -webkit-linear-gradient(left,#3498db,#f47920 10%,#d71345 20%,#f7acbc 30%,#ffd400 40%,#3498db 50%,#f47920 60%,#d71345 70%,#f7acbc 80%,#ffd400 90%,#3498db);
    color: transparent;
    -webkit-background-clip: text;
    background-size: 200% 100%;
    animation: slide 5s infinite linear;
    font-size: 40px;
	}

	@keyframes slide {
		0% {
			background-position: 0 0;
		}
		100% {
		  background-position: -100% 0;
		}
	}
</style>
