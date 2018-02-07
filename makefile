

# -----------------------------------------------
# THIS FILE IS DEPRECIATED --> MOVED TO JEKYLL
# -----------------------------------------------



# npm install -g htmlprocessor

project = zapadisk
# BUILD_DIR = ../$(project)/build/
BUILD_DIR = build/
# htmlfiles =	../$(project)/index.html
htmlfiles =	index.html

cssfiles =  css/style.css\
			assets/css/font-awesome.min.css

jsfiles =   assets/js/jquery.min.js\
			assets/js/jquery.poptrox.min.js\
			assets/js/skel.min.js\
			assets/js/util.js\
			assets/js/main.js

#########################################################################
# BUILD
#########################################################################
all: clean dir html css copies
# = list of things to run at 'make'
.PHONY: all css
# = list of things that don't have dependencies

# create directory ------------------------------------
dir:
	mkdir -p $(BUILD_DIR)

# html files ------------------------------------
html: $(BUILD_DIR)index.html
$(BUILD_DIR)index.html: $(htmlfiles)
	# changes the css files
	htmlprocessor $^ -o build/temp.html 
	# compress
	html-minifier \
		--output $@ \
		--remove-comments \
		--collapse-whitespace \
		--remove-style-link-type-attributes \
		--remove-script-type-attributes \
		--minify-css \
		--minify-urls \
		--minify-js \
		--max-line-length 500 \
		build/temp.html
	# clean
	rm build/temp.html -f

# CSS ------------------------------------
	
css: dir
	mkdir -p $(BUILD_DIR)css/
	# # 1 copy
	# cp css/style.css build/css/
	# 2 uglify
	# uglifycss css/style.css > build/css/style.css
	# # 3 simplify 
	purifycss css/materialize0.99.0.min.css css/style.css index.html  --info --min --out build/css/zapadisk.min.css
	# purifycss : A function that takes content (HTML/JS/PHP/etc) and CSS, and returns only the used CSS.
	# purifycss $(cssfiles) $(htmlfiles) $(jsfiles) --info --min --out $@
	


# JS ------------------------------------

# $(BUILD_DIR)js/$(project).min.js: $(jsfiles)
# 	mkdir -p $(BUILD_DIR)js
# 	uglifyjs $^ --output $@
	
# js: $(BUILD_DIR)js/$(project).min.js


		
# direct copy ------------------------------------
copies:
	cp CNAME $(BUILD_DIR)
	# cp ../$(project)/CNAME build/
	# cp ../$(project)/404.html build/
	mkdir -p $(BUILD_DIR)img/
	cp -r img/zapadi* $(BUILD_DIR)img/
	
	mkdir -p $(BUILD_DIR)fonts/
	cp -r fonts/SoulMi* $(BUILD_DIR)fonts/
	
	cp -r fonts/robot* $(BUILD_DIR)fonts/
	

# CLEAN
#########################################################################
clean:
	rm -rf $(BUILD_DIR)
	
	

