<template>
	<div class="show-editor">
		<vue-editor></vue-editor>
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
</style>
