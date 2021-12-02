# wildfire_visualization_interface
 
# Setup

To generate the multilevel visualization using Beast, use the following command.

```console
./beast-0.9.2/bin/beast mplot wildfire_visualization_4326_reversed.csv 'iformat:point(X,Y)' -skipheader wildfire_visualization_4326_reversed -mercator plotter:gplot levels:12 stroke:red threshold:0
```

Once the command has finished running, use the following command to move the generated data out of the Hadoop filesystem and into the local filesystem

```
hdfs dfs -get wildfire_visualization_4326_reversed .
```

Move the .png files into the data/media/multilevel folder. If the folder does not exist, create it first.