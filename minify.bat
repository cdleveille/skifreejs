@echo off
robocopy public public.min /E >NUL
for %%f in (public.min\js\*.js) do jsmin -l 3 --overwrite %%f