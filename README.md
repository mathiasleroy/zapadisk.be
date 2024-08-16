Zapadisk.be
=================

Ultimate frisbee team website [zapadisk.be](http://zapadisk.be/)  
Team Generator tool: http://zapadisk.be/team-generator.html


FILES
--------------

The root contains the source files.  
The website is in the folder `/docs`.  
This folder is generated with [Jekyll](https://jekyllrb.com/).  


DEPENDENCIES
--------------

- [RubyGems](https://rubyinstaller.org/)
- [jekyll](https://jekyllrb.com/) (`gem install jekyll` and `gem install jekyll-minifier`)
- [nodejs](https://nodejs.org/en)
- [surge](https://surge.sh/) (`npm install --global surge`)


HOW TO MAKE CHANGES / MODIFY PAGES
--------------

1. get the most recent version of the git repo:  

    `git pull origin master`
	
2. make changes in root folder (not /docs)  
cf. [Jekyll documentation](https://jekyllrb.com/)  

3. build -> compiles into 'docs' folder

    `jekyll build`

    (to run locally: `cd docs; jekyll serve` and open localhost::4000)
    
4. deploy:	

    `cd docs; surge; cd ..;`
	
5. push changes: 

    `git add .; git commit -m "whatyouchanged"; git push;`
    
    (first time:  `git push -u origin master`)


Gender-Stats is deployed as a standalone app on https://zapagender.surge.sh for the pwa installation to work.

  `cd gender-stats; surge; cd ..;`


RESOURCES
--------------

- https://joashpereira.com/templates/material_one_pager/
- http://materializecss.com
- http://www.materialpalette.com


LICENSE
--------------

This project is licensed under the [GNU General Public License v3.0](LICENSE). This means that any derivative works based on this project must also be open-source and distributed under the same license.

For more details, please see the [LICENSE](LICENSE) file.


