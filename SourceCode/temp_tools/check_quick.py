import math

# Let's test the curvature coordinates
# ViewBox 0 0 400 400, center at 200, 200
# Hub diameter in 400-space is ~ 80px (radius 40px)
# Upper arc radius: 68px (so text is just ~20px outside hub)
# Lower arc radius: 76px

# Arc 1: M 130,220 A 70,70 0 0,1 270,220
# At x=200, y is 200 - sqrt(70^2 - (200-200)^2) ? No:
# If circle center is (200, 200), equation is (x-200)^2 + (y-cy)^2 = R^2
# For M 132, 216 A 70, 70 0 0, 1 268, 216:
dx = 68
R = 70
dy = math.sqrt(R*R - dx*dx) # sqrt(4900 - 4624) = sqrt(276) = 16.6
# Circle center is at (200, 216 - 16.6) = (200, 199.4) ~ (200, 200)
# Top point of circle is at (200, 199.4 - 70) = (200, 129.4)
# Distance from (200, 200) is 70.6! Exactly concentric with center!
print(f"Top apex distance from center: {200 - 129.4}")

# Lower arc:
# R = 78
# dx = 76
dy_bot = math.sqrt(78*78 - 76*76) # sqrt(6084 - 5776) = sqrt(308) = 17.5
# Start at (200 - 76, 200 - 17.5) = (124, 182.5)
# End at (200 + 76, 200 - 17.5) = (276, 182.5)
# Circle center is at (200, 200)
# Bottom apex is at (200, 200 + 78) = (200, 278)
print(f"Bottom apex distance from center: {278 - 200}")
