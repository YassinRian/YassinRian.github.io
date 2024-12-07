define(function () {
	return {
		html: () => `

<div class="cnt">
<div class="prmt_container">
<input id="box2" name="box2" type="text">
<button class="wis_selecties" data-selectie="select_2">wis selecties</button>
<div class="prmt_box box2">
<h3>Box 2</h3>
  <select class="select_2" multiple>
    <option value="cognos">Cognos</option>
    <option value="javascript">Javascript</option>
    <option value="powerbi">PowerBI</option>
    <option value="oracle">Oracle</option>
    <option value="sql">SQL</option>
    <option value="clojure">Clojure</option>
  </select>
</div>
</div>
</div>

`,
	};
});
