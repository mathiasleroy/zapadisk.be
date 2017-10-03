Zapadisk
=================


ultimate team website [zapadisk.be](http://zapadisk.be/)



FILES
--------------

The root of this project contains the source files.
The published files are in the folder `build`.
All the files there are generated. (you can delete them and regenerate them)


BUILD WEBSITE
--------------

execute

    make

in the terminal.  
It will execute the file `makefile` and create everything that should be in `build`.



HOW TO MODIFY
==============

1  get most recent version:

	git pull
2  make changes in index.html (not build/index.html)
3 deploy	

	cd zapadisk; make; cd build; surge;
4 share changes: 

	cd ..; git add .; git commit -m "whatyouchanged"; git push;



    

RESOURCES
--------------

- https://joashpereira.com/templates/material_one_pager/
- http://materializecss.com
- http://www.materialpalette.com


LICENSE
--------------

```
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.
```

Link: [http://www.wtfpl.net/](http://www.wtfpl.net/)