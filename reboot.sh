#!/bin/sh

sudo killall node
sudo killall chromium-bin
sleep 1
#echo 1 > /proc/sys/kernel/sysrq 
#echo b > /proc/sysrq-trigger
sudo /sbin/shutdown -r now